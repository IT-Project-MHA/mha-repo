from datetime import timedelta
from unittest import mock

from django.contrib.auth.hashers import check_password
from django.core.cache import cache
from django.utils import timezone
from rest_framework.test import APITestCase

from accounts.models import PhoneVerification

PHONE = "+61400000000"
CODE = "123456"
WRONG_CODE = "000000"


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
        cache.clear()  # skip the 1-per-minute limit for this test
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