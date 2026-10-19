from datetime import timedelta, date
from unittest import mock
from types import SimpleNamespace

from django.contrib.auth.hashers import check_password
from django.core.cache import cache
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token

from accounts.models import PhoneVerification, PatientProfile, TermsAndPrivacy, User, UserSettings, TrustedDevice, SupportLink, DeviceToken
from reference.models import QuestionOption
from accounts import permissions
from appointment.models import AppointmentAccess, Appointment

from audit.models import AuditEntry

from io import StringIO

from django.core.management import call_command
from exponent_server_sdk import DeviceNotRegisteredError
from requests.exceptions import ConnectionError

from accounts import permissions, push_notification
from accounts.models import PushToken
from health.models import Assessment
from mpowered_api.validators import current_week_starting

PHONE = "+61490813123"
CODE = "123456"
WRONG_CODE = "000000"
PIN = "196712"
NEW_PIN = "123433"
DEVICE = "josh-phone"


# OTP Tests
class OtpTests(APITestCase):
    # - POST /auth/request-code 
    # - POST /auth/verify-code

    def setUp(self):
        # Reset rate limit counters before every test
        cache.clear()

    def request_code(self, code = CODE):
        # Ask for a code and force the random code to a known value
        with mock.patch("accounts.otp.create_otp", return_value = code):
            return self.client.post("/auth/request-code", {"phone_number": PHONE}, format = "json")

    def verify(self, code):
        # Submit a code for test phone number 
        return self.client.post("/auth/verify-code", {"phone_number": PHONE, "otp": code}, format = "json")

    def test_code_stored_as_hash(self):
        response = self.request_code()
        self.assertEqual(response.status_code, 202)
        row = PhoneVerification.objects.get()
        self.assertNotEqual(row.code, CODE)
        self.assertTrue(check_password(CODE, row.code))

    def test_correct_code(self):
        self.request_code()
        response = self.verify(CODE)
        self.assertEqual(response.status_code, 200)
        self.assertIn("verification_id", response.data)

    def test_same_code_twice(self):
        self.request_code()
        self.verify(CODE)
        response = self.verify(CODE)
        self.assertEqual(response.data["detail"], "used")

    def test_three_wrong_attempts(self):
        self.request_code()
        response = self.verify(WRONG_CODE)
        self.assertEqual(response.data["attempts_remaining"], 2)
        self.verify(WRONG_CODE)
        response = self.verify(WRONG_CODE)
        self.assertEqual(response.data["detail"], "locked")
        # The right code no longer works either thus a new one must be requested
        response = self.verify(CODE)
        self.assertEqual(response.data["detail"], "locked")

    def test_expired_code(self):
        self.request_code()
        PhoneVerification.objects.update(expires_at = timezone.now() - timedelta(seconds = 1))
        response = self.verify(CODE)
        self.assertEqual(response.data["detail"], "expired")

    def test_new_code_replaces_old(self):
        self.request_code(code = "111111")
        cache.clear()
        self.request_code(code = "222222")
        self.assertEqual(self.verify("111111").data["detail"], "invalid")
        self.assertEqual(self.verify("222222").status_code, 200)

    def test_rate_limit(self):
        self.request_code()
        response = self.request_code()
        self.assertEqual(response.status_code, 429)

    def test_wrong_formatted_code(self):
        self.request_code()
        response = self.verify("12ab")
        self.assertEqual(response.status_code, 400)


# Registration Tests
class RegisterTests(APITestCase):
    # POST /auth/register

    def setUp(self):
        cache.clear()
        # Phone that just verified their code
        self.verification = PhoneVerification.objects.create(
            phone_number = PHONE, code = "hash", expires_at = timezone.now(), used_at = timezone.now(),
        )
        self.pain_type = QuestionOption.objects.create(question_key = "pain_type", text = "Back pain")

    def register(self, **changes):
        # Send a valid sign up and swap in fields
        body = {
            "verification_id": str(self.verification.id),
            "phone_number": PHONE,
            "display_name": "josh",
            "pin": PIN,
            "accepted_terms": True,
            "accepted_privacy": True,
            "device_id": DEVICE,
        }
        body.update(changes)

        return self.client.post("/auth/register", body, format = "json")

    def test_create_account(self):
        response = self.register()
        self.assertEqual(response.status_code, 201)
        user = User.objects.get()
        self.assertEqual(user.display_name, "josh")
        self.assertEqual(user.phone_number, PHONE)
        self.assertTrue(UserSettings.objects.filter(user = user).exists())
        self.assertFalse(PatientProfile.objects.exists())
        self.assertFalse(response.data["has_patient_profile"])

    def test_pin_stored_as_hash(self):
        self.register()
        user = User.objects.get()
        self.assertNotEqual(user.password, PIN)
        self.assertTrue(user.check_password(PIN))

    def test_both_documents_validated(self):
        self.register()
        documents = set(TermsAndPrivacy.objects.values_list("document_type", flat = True))
        self.assertEqual(documents, {"terms", "privacy"})

    def test_returns_token(self):
        response = self.register()
        self.assertEqual(response.data["token"], DeviceToken.objects.get(user = User.objects.get()).key)

    def test_track_health(self):
        response = self.register(track_health = True, health = {
            "has_diagnosis": True,
            "assigned_gender_at_birth": "female",
            "birth_year": 1958,
            "pain_types": [str(self.pain_type.id)],
        })
        self.assertEqual(response.status_code, 201)
        profile = PatientProfile.objects.get()
        self.assertTrue(profile.has_diagnosis)
        self.assertEqual(profile.birth_year, 1958)
        self.assertEqual(list(profile.pain_types.all()), [self.pain_type])

    def test_track_health_without_details(self):
        response = self.register(track_health = True)
        self.assertEqual(response.status_code, 201)
        self.assertTrue(PatientProfile.objects.exists())

    def test_details_without_tracking(self):
        response = self.register(health = {"has_diagnosis": True})
        self.assertEqual(response.status_code, 400)
        self.assertFalse(User.objects.exists())

    def test_terms_must_be_accepted(self):
        response = self.register(accepted_privacy = False)
        self.assertEqual(response.status_code, 400)
        self.assertFalse(User.objects.exists())

    def test_pin_must_be_six_digits(self):
        response = self.register(pin = "12345")
        self.assertEqual(response.status_code, 400)

    def test_expired_verification(self):
        PhoneVerification.objects.update(used_at = timezone.now() - timedelta(minutes = 11))
        response = self.register()
        self.assertEqual(response.data["detail"], "verification_invalid")

    def test_phone_number_already_registered(self):
        self.register()
        response = self.register()
        self.assertEqual(response.status_code, 409)
        self.assertEqual(User.objects.count(), 1)

    def test_verification_for_different_phone_number(self):
        response = self.register(phone_number = "+61411111111")
        self.assertEqual(response.data["detail"], "verification_invalid")

    def test_code_never_verified(self):
        PhoneVerification.objects.update(used_at = None)
        response = self.register()
        self.assertEqual(response.data["detail"], "verification_invalid")

    def test_nothing_saved_if_step_fails(self):
        # Break the profile step and check nothing was kept
        with mock.patch("accounts.registration.create_patient_profile", side_effect = RuntimeError):
            with self.assertRaises(RuntimeError):
                self.register(track_health = True)

        self.assertFalse(User.objects.exists())
        self.assertFalse(TermsAndPrivacy.objects.exists())

    def test_register_trusts_device(self):
        self.register()
        self.assertTrue(TrustedDevice.objects.filter(user = User.objects.get(), device_id = DEVICE).exists())

    def test_health_is_audited(self):
        self.register(track_health = True)
        entry = AuditEntry.objects.get()
        self.assertEqual(entry.action, AuditEntry.Action.CREATE)
        self.assertEqual(entry.target_type, AuditEntry.Target.PATIENT_PROFILE)
        self.assertEqual(entry.audit_user, User.objects.get())

    def test_no_audit_without_health(self):
        self.register()
        self.assertFalse(AuditEntry.objects.exists())

# Login and Logout Tests
class LoginTests(APITestCase):
    # POST /auth/login
    # POST /auth/logout

    def setUp(self):
        cache.clear()
        # Existing account that has signed in on DEVICE before
        self.user = User.objects.create_user(PHONE, "josh", PIN)
        TrustedDevice.objects.create(user = self.user, device_id = DEVICE)

    def login(self, **changes):
        body = {"phone_number": PHONE, "pin": PIN, "device_id": DEVICE}
        body.update(changes)
        return self.client.post("/auth/login", body, format = "json")

    def verified_phone(self):
        return PhoneVerification.objects.create(
            phone_number = PHONE, code = "hash", expires_at = timezone.now(), used_at = timezone.now(),
        )

    def test_trusted_device_logs_in(self):
        response = self.login()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["token"], DeviceToken.objects.get(user = self.user).key)

    def test_wrong_pin(self):
        response = self.login(pin = "000000")
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.data["detail"], "invalid_credentials")

    def test_unknown_phone_number(self):
        response = self.login(phone_number = "+61499999999")
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.data["detail"], "invalid_credentials")

    def test_deleted_account(self):
        User.objects.update(deleted_at = timezone.now())
        response = self.login()
        self.assertEqual(response.data["detail"], "invalid_credentials")

    def test_new_device_needs_otp(self):
        response = self.login(device_id = "new-phone")
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.data["detail"], "verification_required")

    def test_new_device_with_otp(self):
        verification = self.verified_phone()
        response = self.login(device_id = "new-phone", verification_id = str(verification.id))
        self.assertEqual(response.status_code, 200)
        self.assertTrue(TrustedDevice.objects.filter(user = self.user, device_id = "new-phone").exists())

    def test_new_device_with_unverified_otp(self):
        verification = self.verified_phone()
        PhoneVerification.objects.update(used_at = None)
        response = self.login(device_id = "new-phone", verification_id = str(verification.id))
        self.assertEqual(response.data["detail"], "verification_invalid")
        self.assertFalse(TrustedDevice.objects.filter(device_id = "new-phone").exists())

    def test_revoked_device_needs_otp(self):
        TrustedDevice.objects.update(revoked_at = timezone.now())
        response = self.login()
        self.assertEqual(response.data["detail"], "verification_required")

    def test_each_device_gets_its_own_token(self):
        first = self.login()
        TrustedDevice.objects.create(user = self.user, device_id = "new-phone")
        second = self.login(device_id = "new-phone")
        self.assertNotEqual(first.data["token"], second.data["token"])

    def test_logout_deletes_token(self):
        token = self.login().data["token"]
        self.client.credentials(HTTP_AUTHORIZATION = f"Token {token}")
        response = self.client.post("/auth/logout")
        self.assertEqual(response.status_code, 204)
        self.assertFalse(DeviceToken.objects.filter(user = self.user).exists())

    def test_old_token_rejected(self):
        token = self.login().data["token"]
        self.client.credentials(HTTP_AUTHORIZATION = f"Token {token}")
        self.client.post("/auth/logout")
        response = self.client.post("/auth/logout")
        self.assertEqual(response.status_code, 401)

    def test_logout_needs_token(self):
        response = self.client.post("/auth/logout")
        self.assertEqual(response.status_code, 401)

    def test_login_updates_last_seen(self):
        old = timezone.now() - timedelta(days = 3)
        TrustedDevice.objects.update(last_seen_at = old)
        self.login()
        self.assertGreater(TrustedDevice.objects.get().last_seen_at, old)

    def test_logout_keeps_other_phone_signed_in(self):
        phone_token = self.login().data["token"]
        TrustedDevice.objects.create(user = self.user, device_id = "new-phone")
        ipad_token = self.login(device_id = "new-phone").data["token"]

        self.client.credentials(HTTP_AUTHORIZATION = f"Token {phone_token}")
        self.client.post("/auth/logout")

        self.client.credentials(HTTP_AUTHORIZATION = f"Token {ipad_token}")
        self.assertEqual(self.client.get("/auth/devices").status_code, 200)

    def test_logout_everywhere(self):
        phone_token = self.login().data["token"]
        TrustedDevice.objects.create(user = self.user, device_id = "new-phone")
        self.login(device_id = "new-phone")

        self.client.credentials(HTTP_AUTHORIZATION = f"Token {phone_token}")
        self.assertEqual(self.client.post("/auth/logout-everywhere").status_code, 204)
        self.assertFalse(DeviceToken.objects.filter(user = self.user).exists())


class DeviceTests(APITestCase):
    # GET /auth/devices
    # POST /auth/devices/{id}/revoke

    def setUp(self):
        cache.clear()

        # Signed in user with two phone
        self.user = User.objects.create_user(PHONE, "josh", PIN)
        self.my_phone = TrustedDevice.objects.create(user = self.user, device_id = DEVICE)
        self.phone = TrustedDevice.objects.create(user = self.user, device_id = "joshs-ipad")
        
        # Someone else's device that should never show up
        other_user = User.objects.create_user("+61499999999", "Other", PIN)
        self.other_device = TrustedDevice.objects.create(user = other_user, device_id = "other-phone")

        # Signed in on the phone
        self.token = DeviceToken.objects.create(user = self.user, device = self.my_phone)
        self.client.credentials(HTTP_AUTHORIZATION = f"Token {self.token.key}")

    def revoke(self, device):
        return self.client.post(f"/auth/devices/{device.id}/revoke")

    def test_list_devices(self):
        response = self.client.get("/auth/devices")
        self.assertEqual(response.status_code, 200)
        device_ids = {device["device_id"] for device in response.data}
        self.assertEqual(device_ids, {DEVICE, "joshs-ipad"})

    def test_revoke_device(self):
        response = self.revoke(self.phone)
        self.assertEqual(response.status_code, 204)
        self.phone.refresh_from_db()
        self.assertIsNotNone(self.phone.revoked_at)

    def test_revoked_devices_not_listed(self):
        TrustedDevice.objects.filter(pk = self.phone.pk).update(revoked_at = timezone.now())
        response = self.client.get("/auth/devices")
        self.assertEqual([device["device_id"] for device in response.data], [DEVICE])

    def test_revoke_signs_out_only_that_device(self):
        ipad_token = DeviceToken.objects.create(user = self.user, device = self.phone)
        self.revoke(self.phone)
        self.assertFalse(DeviceToken.objects.filter(pk = ipad_token.pk).exists())
        self.assertEqual(self.client.get("/auth/devices").status_code, 200)

    def test_revoked_device_needs_otp(self):
        self.revoke(self.phone)
        self.client.credentials()
        response = self.client.post(
            "/auth/login", {"phone_number": PHONE, "pin": PIN, "device_id": "josh-ipad"}, format = "json"
        )
        self.assertEqual(response.data["detail"], "verification_required")

    def test_revoke_someone_elses_device(self):
        response = self.revoke(self.other_device)
        self.assertEqual(response.status_code, 404)
        self.other_device.refresh_from_db()
        self.assertIsNone(self.other_device.revoked_at)

    def test_needs_login(self):
        self.client.credentials()
        self.assertEqual(self.client.get("/auth/devices").status_code, 401)
        self.assertEqual(self.revoke(self.phone).status_code, 401)



# Reset Pin Tests
class ResetPinTests(APITestCase):
    # POST /auth/reset-pin

    def setUp(self):
        cache.clear()

        # Account signed in on a phone and an ipad
        self.user = User.objects.create_user(PHONE, "Josh", PIN)
        self.phone = TrustedDevice.objects.create(user = self.user, device_id = DEVICE)
        self.ipad = TrustedDevice.objects.create(user = self.user, device_id = "josh-ipad")
        self.old_token = DeviceToken.objects.create(user = self.user, device = self.ipad)

        # Phone that just passed verify-code
        self.verification = PhoneVerification.objects.create(
            phone_number = PHONE, code = "hash", expires_at = timezone.now(), used_at = timezone.now(),
        )

    def reset(self, **changes):
        # Send a valid reset and swap in fields
        body = {
            "phone_number": PHONE,
            "verification_id": str(self.verification.id),
            "pin": NEW_PIN,
            "device_id": DEVICE,
        }
        body.update(changes)

        return self.client.post("/auth/reset-pin", body, format = "json")

    def login(self, pin, device_id):
        return self.client.post(
            "/auth/login", {"phone_number": PHONE, "pin": pin, "device_id": device_id}, format = "json"
        )

    def test_reset_pin(self):
        response = self.reset()
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password(NEW_PIN))
        self.assertFalse(self.user.check_password(PIN))

    def test_old_pin_stops(self):
        self.reset()
        self.assertEqual(self.login(PIN, DEVICE).status_code, 401)

    def test_old_token_deleted(self):
        response = self.reset()
        self.assertFalse(DeviceToken.objects.filter(key = self.old_token.key).exists())
        self.assertNotEqual(response.data["token"], self.old_token.key)

    def test_other_devices_signed_out(self):
        self.reset()
        self.ipad.refresh_from_db()
        self.assertIsNotNone(self.ipad.revoked_at)
        self.assertEqual(self.login(NEW_PIN, "josh-ipad").data["detail"], "verification_required")

    def test_device_stays_trusted(self):
        self.reset()
        self.assertEqual(self.login(NEW_PIN, DEVICE).status_code, 200)

    def test_needs_verified_phone(self):
        PhoneVerification.objects.update(used_at = None)
        response = self.reset()
        self.assertEqual(response.data["detail"], "verification_invalid")
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password(PIN))

    def test_no_account_for_phone(self):
        PhoneVerification.objects.update(phone_number = "+61499999999")
        response = self.reset(phone_number = "+61499999999")
        self.assertEqual(response.data["detail"], "no_account")

    def test_pin_must_be_six_digits(self):
        response = self.reset(pin = "1234")
        self.assertEqual(response.status_code, 400)


# Permissions and Access
class PermissionTests(APITestCase):

    def setUp(self):
        # Patient with two appointments
        self.patient = User.objects.create_user(PHONE, "Josh", PIN)
        self.profile = PatientProfile.objects.create(user = self.patient)
        self.appointment = Appointment.objects.create(
            patient_profile = self.profile, scheduled_date = timezone.now(), created_by = self.patient,
        )
        self.other_appointment = Appointment.objects.create(
            patient_profile = self.profile, scheduled_date = timezone.now(), created_by = self.patient,
        )

        # Supporter with an active link but all switches off
        self.supporter = User.objects.create_user("+61411111111", "Mum", PIN)
        self.link = SupportLink.objects.create(
            patient_profile = self.profile,
            patient_user = self.patient,
            supporter_user = self.supporter,
            status = SupportLink.Status.ACTIVE,
        )

        # Someone with no link
        self.stranger = User.objects.create_user("+61422222222", "Stranger", PIN)

    def turn_on_switches(self, **switches):
        # Patient turns on switches for the supporter
        SupportLink.objects.filter(pk = self.link.pk).update(**switches)

    def grant(self, appointment, **flags):
        # Patient invites the supporter to one appointment
        return AppointmentAccess.objects.create(appointment = appointment, support_link = self.link, **flags)

    def test_patient_has_all_permissions(self):
        self.assertTrue(permissions.can_view_assessments(self.patient, self.profile))
        self.assertTrue(permissions.can_view_prescriptions(self.patient, self.profile))
        self.assertTrue(permissions.can_view_appointment(self.patient, self.appointment))
        self.assertTrue(permissions.can_add_question(self.patient, self.appointment))
        self.assertTrue(permissions.can_record_answer(self.patient, self.appointment))
        self.assertTrue(permissions.can_edit_patient_data(self.patient, self.profile))

    def test_stranger_has_no_permissions(self):
        self.assertFalse(permissions.can_view_assessments(self.stranger, self.profile))
        self.assertFalse(permissions.can_view_appointment(self.stranger, self.appointment))
        self.assertFalse(permissions.can_edit_patient_data(self.stranger, self.profile))

    def test_supporter_sees_nothing_until_switched_on(self):
        self.assertFalse(permissions.can_view_assessments(self.supporter, self.profile))
        self.assertFalse(permissions.can_view_prescriptions(self.supporter, self.profile))
        self.assertFalse(permissions.can_view_appointment(self.supporter, self.appointment))

    def test_switch_only_opens_own_area(self):
        self.turn_on_switches(can_view_assessments = True)
        self.assertTrue(permissions.can_view_assessments(self.supporter, self.profile))
        self.assertFalse(permissions.can_view_prescriptions(self.supporter, self.profile))

    def test_appointments_switch_shows_all_appointments(self):
        self.turn_on_switches(can_view_appointments = True)
        self.assertTrue(permissions.can_view_appointment(self.supporter, self.appointment))
        self.assertTrue(permissions.can_view_appointment(self.supporter, self.other_appointment))

    def test_invited_link_gives_no_access(self):
        self.turn_on_switches(status = SupportLink.Status.INVITED, can_view_assessments = True)
        self.assertFalse(permissions.can_view_assessments(self.supporter, self.profile))

    def test_revoked_link_gives_no_access(self):
        self.turn_on_switches(status = SupportLink.Status.REVOKED, can_view_assessments = True)
        self.assertFalse(permissions.can_view_assessments(self.supporter, self.profile))

    def test_supporter_can_never_edit(self):
        self.turn_on_switches(can_view_assessments = True, can_view_prescriptions = True, can_view_appointments = True)
        self.assertFalse(permissions.can_edit_patient_data(self.supporter, self.profile))

    def test_grant_shows_only_that_appointment(self):
        self.grant(self.appointment)
        self.assertTrue(permissions.can_view_appointment(self.supporter, self.appointment))
        self.assertFalse(permissions.can_view_appointment(self.supporter, self.other_appointment))

    def test_grant_flags(self):
        self.grant(self.appointment, can_add_questions = True)
        self.assertTrue(permissions.can_add_question(self.supporter, self.appointment))
        self.assertFalse(permissions.can_record_answer(self.supporter, self.appointment))

    def test_revoked_grant(self):
        self.grant(self.appointment, can_add_questions = True, revoked_at = timezone.now())
        self.assertFalse(permissions.can_view_appointment(self.supporter, self.appointment))
        self.assertFalse(permissions.can_add_question(self.supporter, self.appointment))

    def test_grant_needs_active_link(self):
        self.grant(self.appointment, can_add_questions = True)
        self.turn_on_switches(status = SupportLink.Status.REVOKED)
        self.assertFalse(permissions.can_add_question(self.supporter, self.appointment))


class PhoneNumberTests(APITestCase):

    def setUp(self):
        cache.clear()

    def request_code(self, phone):
        with mock.patch("accounts.otp.create_otp", return_value = CODE):
            return self.client.post("/auth/request-code", {"phone_number": phone}, format = "json")

    def test_any_format_saved_the_same(self):
        self.request_code("0490 813 123")
        self.assertEqual(PhoneVerification.objects.get().phone_number, PHONE)

    def test_not_a_phone_number(self):
        response = self.request_code("josh")
        self.assertEqual(response.status_code, 400)
        self.assertIn("phone_number", response.data)
        self.assertFalse(PhoneVerification.objects.exists())

    def test_landline_rejected(self):
        response = self.request_code("03 9081 3123")
        self.assertEqual(response.status_code, 400)

    def test_phone_number_different_formatting(self):
        self.request_code(PHONE)
        response = self.request_code("0490-813-123")
        self.assertEqual(response.status_code, 429)

    def test_login_with_local_format(self):
        user = User.objects.create_user(PHONE, "Josh", PIN)
        TrustedDevice.objects.create(user = user, device_id = DEVICE)
        response = self.client.post(
            "/auth/login", {"phone_number": "0490 813 123", "pin": PIN, "device_id": DEVICE}, format = "json"
        )
        self.assertEqual(response.status_code, 200)


class MissingFieldTests(APITestCase):
    # Check every endpoint rejects a request missing a field

    def setUp(self):
        cache.clear()

    def test_missing_fields(self):
        cases = [
            ("/auth/request-code", {}, "phone_number"),
            ("/auth/verify-code", {"phone_number": PHONE}, "otp"),
            ("/auth/register", {"phone_number": PHONE, "pin": PIN}, "display_name"),
            ("/auth/login", {"phone_number": PHONE, "device_id": DEVICE}, "pin"),
            ("/auth/reset-pin", {"phone_number": PHONE, "pin": PIN, "device_id": DEVICE}, "verification_id"),
        ]

        for url, body, missing in cases:
            with self.subTest(url = url):
                response = self.client.post(url, body, format = "json")
                self.assertEqual(response.status_code, 400)
                self.assertIn(missing, response.data)


# API Security tests
class AccountApiSecurityTests(APITestCase):

    def setUp(self):
        self.patient = User.objects.create_user(PHONE, "Josh", PIN)
        self.profile = PatientProfile.objects.create(user = self.patient)

        # Supporter who has been invited but not accepted yet
        self.supporter = User.objects.create_user("+61411111111", "Mum", PIN)
        self.link = SupportLink.objects.create(
            patient_profile = self.profile,
            patient_user = self.patient,
            supporter_user = self.supporter,
            status = SupportLink.Status.INVITED,
        )

    def set_status(self, status):
        self.client.force_authenticate(self.supporter)
        return self.client.patch(f"/api/supportLink/{self.link.pk}", {"status": status}, format = "json")

    def test_phone_verification_endpoint_removed(self):
        response = self.client.post("/api/phoneVerification/", {"phone_number": PHONE}, format = "json")
        self.assertEqual(response.status_code, 404)

    def test_cannot_create_user(self):
        self.client.force_authenticate(self.patient)
        response = self.client.post("/api/user/", {"phone_number": "+61433333333", "display_name": "New"}, format = "json")
        self.assertEqual(response.status_code, 405)
        self.assertFalse(User.objects.filter(phone_number = "+61433333333").exists())

    def test_trusted_device_read_only(self):
        device = TrustedDevice.objects.create(user = self.patient, device_id = DEVICE, revoked_at = timezone.now())
        self.client.force_authenticate(self.patient)

        self.assertEqual(self.client.get("/api/trustedDevice/").status_code, 200)
        self.assertEqual(self.client.post("/api/trustedDevice/", {"device_id": "new-phone"}, format = "json").status_code, 405)
        self.assertEqual(self.client.patch(f"/api/trustedDevice/{device.pk}", {"revoked_at": None}, format = "json").status_code, 405)
        self.assertEqual(self.client.delete(f"/api/trustedDevice/{device.pk}").status_code, 405)
        device.refresh_from_db()
        self.assertIsNotNone(device.revoked_at)

    def test_supporter_can_accept_then_leave(self):
        self.assertEqual(self.set_status("active").status_code, 200)
        self.assertEqual(self.set_status("revoked").status_code, 200)

    def test_supporter_can_decline_invite(self):
        self.assertEqual(self.set_status("revoked").status_code, 200)

    def test_supporter_cannot_unrevoke(self):
        SupportLink.objects.filter(pk = self.link.pk).update(status = SupportLink.Status.REVOKED)
        self.assertEqual(self.set_status("active").status_code, 400)
        self.assertEqual(self.set_status("invited").status_code, 400)
        self.link.refresh_from_db()
        self.assertEqual(self.link.status, SupportLink.Status.REVOKED)

    def test_supporter_cannot_go_back_to_invited(self):
        SupportLink.objects.filter(pk = self.link.pk).update(status = SupportLink.Status.ACTIVE)
        self.assertEqual(self.set_status("invited").status_code, 400)


# Deleting the account, stopping tracking, inviting, switches and changing phone number
class AccountLifecycleTests(APITestCase):

    def setUp(self):
        cache.clear()
        self.patient = User.objects.create_user(PHONE, "Josh", PIN)
        self.profile = PatientProfile.objects.create(user = self.patient, has_diagnosis = True, birth_year = 1990)
        self.supporter = User.objects.create_user("+61411111111", "Mum", PIN)
        self.client.force_authenticate(self.patient)

    def invite(self, phone, **switches):
        return self.client.post("/api/supportLink/", {"invited_phone_number": phone, **switches}, format = "json")

    def verified(self, phone):
        # Phone that just passed verify-code
        return PhoneVerification.objects.create(
            phone_number = phone, code = "hash", expires_at = timezone.now(), used_at = timezone.now())

    def test_delete_account_is_soft(self):
        DeviceToken.objects.create(user = self.patient, device = TrustedDevice.objects.create(user = self.patient, device_id = DEVICE))
        self.assertEqual(self.client.delete(f"/api/user/{self.patient.pk}").status_code, 204)
        self.patient.refresh_from_db()
        self.profile.refresh_from_db()
        self.assertIsNotNone(self.patient.deleted_at)
        self.assertFalse(self.patient.is_active)
        self.assertFalse(DeviceToken.objects.filter(user = self.patient).exists())
        self.assertIsNotNone(self.profile.deleted_at)

    def test_number_can_sign_up_again_after_delete(self):
        self.client.delete(f"/api/user/{self.patient.pk}")
        User.objects.create_user(PHONE, "New Josh", PIN)
        self.assertEqual(User.objects.filter(phone_number = PHONE).count(), 2)

    def test_stop_and_restart_tracking(self):
        self.assertEqual(self.client.delete(f"/api/patientProfile/{self.profile.pk}").status_code, 204)
        self.assertEqual(len(self.client.get("/api/patientProfile/").data), 0)

        # Starting again brings back the same profile
        response = self.client.post("/api/patientProfile/", {"has_diagnosis": False}, format = "json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["id"], str(self.profile.pk))

    def test_invite_existing_account(self):
        response = self.invite("0411 111 111", can_view_assessments = True)
        self.assertEqual(response.status_code, 201)

        link = SupportLink.objects.get()
        self.assertEqual(link.supporter_user, self.supporter)
        self.assertTrue(link.can_view_assessments)
        self.assertTrue(AuditEntry.objects.filter(action = AuditEntry.Action.SHARE).exists())

    def test_invite_new_number_links_on_sign_up(self):
        with mock.patch("accounts.invite.send_sms") as send_sms:
            self.invite("0422 222 222")
        send_sms.assert_called_once()

        # Sign up with number
        self.client.force_authenticate(None)
        verification = self.verified("+61422222222")
        self.client.post("/auth/register", {
            "verification_id": str(verification.id), "phone_number": "0422222222", "display_name": "Dad",
            "pin": PIN, "accepted_terms": True, "accepted_privacy": True, "device_id": DEVICE,
        }, format = "json")

        self.assertEqual(SupportLink.objects.get().supporter_user.display_name, "Dad")

    def test_cannot_invite_self(self):
        self.assertEqual(self.invite(PHONE).status_code, 400)

    def test_cannot_invite_twice(self):
        self.invite("0411111111")
        self.assertEqual(self.invite("0411111111").status_code, 400)

    def test_invalid_phone(self):
        self.assertEqual(self.invite("12345").status_code, 400)

    def test_delete_revokes_and_can_invite_again(self):
        self.invite("0411111111")
        link = SupportLink.objects.get()
        self.assertEqual(self.client.delete(f"/api/supportLink/{link.pk}").status_code, 204)
        link.refresh_from_db()
        self.assertEqual(link.status, SupportLink.Status.REVOKED)

        # The revoked row is reused, only one link per patient and supporter
        self.assertEqual(self.invite("0411111111").status_code, 201)
        self.assertEqual(SupportLink.objects.count(), 1)

    def test_patient_revokes_by_status(self):
        self.invite("0411111111")
        link = SupportLink.objects.get()
        response = self.client.patch(f"/api/supportLink/{link.pk}", {"status": "revoked"}, format = "json")
        self.assertEqual(response.status_code, 200)
        link.refresh_from_db()
        self.assertIsNotNone(link.revoked_at)


    def test_supporter_accepts(self):
        self.invite("0411111111")
        link = SupportLink.objects.get()
        self.client.force_authenticate(self.supporter)
        response = self.client.patch(f"/api/supportLink/{link.pk}", {"status": "active"}, format = "json")
        self.assertEqual(response.status_code, 200)
        link.refresh_from_db()
        self.assertIsNotNone(link.accepted_at)

    def test_patient_cannot_accept_for_supporter(self):
        self.invite("0411111111")
        link = SupportLink.objects.get()
        response = self.client.patch(f"/api/supportLink/{link.pk}", {"status": "active"}, format = "json")
        self.assertEqual(response.status_code, 400)

    def test_patient_changes_switches(self):
        self.invite("0411111111")
        link = SupportLink.objects.get()
        response = self.client.patch(f"/api/supportLink/{link.pk}", {"can_view_prescriptions": True}, format = "json")
        self.assertEqual(response.status_code, 200)
        link.refresh_from_db()
        self.assertTrue(link.can_view_prescriptions)

    def test_supporter_cannot_change_switches(self):
        self.invite("0411111111")
        link = SupportLink.objects.get()
        self.client.force_authenticate(self.supporter)
        response = self.client.patch(f"/api/supportLink/{link.pk}", {"can_view_prescriptions": True}, format = "json")
        self.assertEqual(response.status_code, 400)

    def test_supporter_sees_profile_without_health_details(self):
        self.invite("0411111111")
        SupportLink.objects.update(status = SupportLink.Status.ACTIVE)
        self.client.force_authenticate(self.supporter)

        response = self.client.get(f"/api/patientProfile/{self.profile.pk}")
        self.assertEqual(response.status_code, 200)
        self.assertNotIn("has_diagnosis", response.data)
        self.assertNotIn("birth_year", response.data)


    def test_change_phone(self):
        verification = self.verified("+61433333333")
        response = self.client.post("/auth/change-phone", {"verification_id": str(verification.id),
                                                           "phone_number": "0433 333 333"}, format = "json")
        self.assertEqual(response.status_code, 200)
        self.patient.refresh_from_db()
        self.assertEqual(self.patient.phone_number, "+61433333333")

    def test_change_phone_needs_otp(self):
        response = self.client.post("/auth/change-phone", {"verification_id": str(PhoneVerification().id),
                                                           "phone_number": "0433333333"}, format = "json")
        self.assertEqual(response.status_code, 400)

    def test_change_phone_taken(self):
        verification = self.verified("+61411111111")
        response = self.client.post("/auth/change-phone", {"verification_id": str(verification.id),
                                                           "phone_number": "0411111111"}, format = "json")
        self.assertEqual(response.status_code, 409)


# Push notification tokens, sending and the reminders command
class PushNotificationTests(APITestCase):

    def setUp(self):
        self.patient = User.objects.create_user(PHONE, "Josh", PIN)
        self.profile = PatientProfile.objects.create(user = self.patient)
        self.push_token = PushToken.objects.create(user = self.patient, token = "ExponentPushToken[abc]")

    def register_token(self, token):
        self.client.force_authenticate(self.patient)
        return self.client.post("/auth/push-token", {"token": token}, format = "json")

    def run_reminders(self, *flags):
        with mock.patch("accounts.push_notification.PushClient") as push_client:
            call_command("send_reminders", *flags, stdout = StringIO())
        return [call[0][0] for call in push_client.return_value.publish.call_args_list]

    def test_register_token(self):
        self.assertEqual(self.register_token("ExponentPushToken[new]").status_code, 204)
        self.assertTrue(PushToken.objects.filter(user = self.patient, token = "ExponentPushToken[new]").exists())

    def test_bad_token(self):
        self.assertEqual(self.register_token("not-a-token").status_code, 400)

    def test_logout_removes_tokens(self):
        device = TrustedDevice.objects.create(user = self.patient, device_id = DEVICE)
        PushToken.objects.filter(pk = self.push_token.pk).update(device = device)
        token = DeviceToken.objects.create(user = self.patient, device = device)
        self.client.credentials(HTTP_AUTHORIZATION = f"Token {token.key}")
        self.client.post("/auth/logout")

    def test_uninstalled_app_token_removed(self):
        with mock.patch("accounts.push_notification.PushClient") as push_client:
            push_client.return_value.publish.return_value.validate_response.side_effect = \
                DeviceNotRegisteredError(mock.Mock())
            push_notification.send_push(User.objects.all(), "Title", "Body")
        self.assertFalse(PushToken.objects.exists())

    def test_assessment_reminder(self):
        messages = self.run_reminders("--assessments")
        self.assertEqual(len(messages), 1)
        self.assertEqual(messages[0].to, "ExponentPushToken[abc]")

    def test_no_reminder_once_submitted(self):
        Assessment.objects.create(patient_profile = self.profile, week_starting = current_week_starting(),
                                  status = Assessment.Status.SUBMITTED)
        self.assertEqual(self.run_reminders("--assessments"), [])


    def test_appointment_reminder(self):
        tomorrow = timezone.now() + timedelta(days = 1)
        Appointment.objects.create(patient_profile = self.profile, scheduled_date = tomorrow, created_by = self.patient)
        messages = self.run_reminders("--appointments")
        self.assertEqual(len(messages), 1)
        self.assertNotIn("Dr", messages[0].body)

    def test_no_appointment_reminder_next_week(self):
        Appointment.objects.create(patient_profile = self.profile, scheduled_date = timezone.now() + timedelta(days = 7),
                                   created_by = self.patient)
        self.assertEqual(self.run_reminders("--appointments"), [])

    def test_no_reminder_when_notifications_off(self):
        UserSettings.objects.create(user = self.patient, notifications_enabled = False)
        self.assertEqual(self.run_reminders("--assessments"), [])
