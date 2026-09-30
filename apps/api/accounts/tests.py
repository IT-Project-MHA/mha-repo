from datetime import timedelta
from unittest import mock

from django.contrib.auth.hashers import check_password
from django.core.cache import cache
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token

from accounts.models import PhoneVerification, PatientProfile, TermsAndPrivacy, User, UserSettings
from reference.models import QuestionOption

PHONE = "+61400000000"
CODE = "123456"
WRONG_CODE = "000000"
PIN = "196712"

# OTP Tests
class OtpTests(APITestCase):
    # - POST /auth/request-code 
    # - POST /auth/verify-code

    def setUp(self):
        # Reset rate-limit counters before every test
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
            "display_name": "Josh",
            "pin": PIN,
            "accepted_terms": True,
            "accepted_privacy": True,
        }
        body.update(changes)

        return self.client.post("/auth/register", body, format = "json")

    def test_create_account(self):
        response = self.register()
        self.assertEqual(response.status_code, 201)
        user = User.objects.get()
        self.assertEqual(user.display_name, "Josh")
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