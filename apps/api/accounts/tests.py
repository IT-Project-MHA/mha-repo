from datetime import timedelta, date
from unittest import mock
from types import SimpleNamespace

from django.contrib.auth.hashers import check_password
from django.core.cache import cache
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token

from accounts.models import PhoneVerification, PatientProfile, TermsAndPrivacy, User, UserSettings, TrustedDevice, SupportLink
from reference.models import QuestionOption
from accounts import permissions
from appointment.models import AppointmentAccess, Appointment

from audit.models import AuditEntry

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
        self.assertEqual(response.data["token"], Token.objects.get(user = User.objects.get()).key)

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
        self.assertEqual(response.data["token"], Token.objects.get(user = self.user).key)

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

    def test_same_token_on_every_device(self):
        first = self.login()
        TrustedDevice.objects.create(user = self.user, device_id = "new-phone")
        second = self.login(device_id = "new-phone")
        self.assertEqual(first.data["token"], second.data["token"])

    def test_logout_deletes_token(self):
        token = self.login().data["token"]
        self.client.credentials(HTTP_AUTHORIZATION = f"Token {token}")
        response = self.client.post("/auth/logout")
        self.assertEqual(response.status_code, 204)
        self.assertFalse(Token.objects.filter(user = self.user).exists())

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


class DeviceTests(APITestCase):
    # GET /auth/devices
    # POST /auth/devices/{id}/revoke

    def setUp(self):
        cache.clear()

        # Signed in user with two phone
        self.user = User.objects.create_user(PHONE, "josh", PIN)
        self.phone = TrustedDevice.objects.create(user = self.user, device_id = DEVICE)
        self.phone = TrustedDevice.objects.create(user = self.user, device_id = "joshs-ipad")

        # Someone else's device that should never show up
        other_user = User.objects.create_user("+61499999999", "Other", PIN)
        self.other_device = TrustedDevice.objects.create(user = other_user, device_id = "other-phone")

        self.token = Token.objects.create(user = self.user)
        self.client.credentials(HTTP_AUTHORIZATION = f"Token {self.token.key}")

    def revoke(self, device):
        return self.client.post(f"/auth/devices/{device.id}/revoke")

    def test_list_my_devices(self):
        response = self.client.get("/auth/devices")
        self.assertEqual(response.status_code, 200)
        device_ids = {device["device_id"] for device in response.data}
        self.assertEqual(device_ids, {DEVICE, "joshs-ipad"})

    def test_revoked_devices_not_listed(self):
        TrustedDevice.objects.filter(pk = self.phone.pk).update(revoked_at = timezone.now())
        response = self.client.get("/auth/devices")
        self.assertEqual([device["device_id"] for device in response.data], [DEVICE])

    def test_revoke_device(self):
        response = self.revoke(self.phone)
        self.assertEqual(response.status_code, 204)
        self.phone.refresh_from_db()
        self.assertIsNotNone(self.phone.revoked_at)

    def test_revoke_also_signs_out(self):
        self.revoke(self.phone)
        self.assertFalse(Token.objects.filter(user = self.user).exists())
        response = self.client.get("/auth/devices")
        self.assertEqual(response.status_code, 401)

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
        self.old_token = Token.objects.create(user = self.user)

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
        self.assertFalse(Token.objects.filter(key = self.old_token.key).exists())
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

        # Supporter with an active link but switches off
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

    def test_view_permission_reads_and_writes(self):
        # Supporter can read with the switch on but only the patient can write
        self.turn_on_switches(can_view_assessments = True)
        record = SimpleNamespace(patient_profile = self.profile)
        check = permissions.AssessmentPermission()

        supporter_get = SimpleNamespace(method = "GET", user = self.supporter)
        supporter_patch = SimpleNamespace(method = "PATCH", user = self.supporter)
        patient_patch = SimpleNamespace(method = "PATCH", user = self.patient)

        self.assertTrue(check.has_object_permission(supporter_get, None, record))
        self.assertFalse(check.has_object_permission(supporter_patch, None, record))
        self.assertTrue(check.has_object_permission(patient_patch, None, record))

    def test_appointment_permission_uses_grant(self):
        self.grant(self.appointment)
        check = permissions.AppointmentPermission()
        supporter_get = SimpleNamespace(method = "GET", user = self.supporter)

        self.assertTrue(check.has_object_permission(supporter_get, None, self.appointment))
        self.assertFalse(check.has_object_permission(supporter_get, None, self.other_appointment))


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