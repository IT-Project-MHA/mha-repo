from io import StringIO
from unittest import mock

from django.core.cache import cache
from django.core.management import call_command
from rest_framework.test import APITestCase

from mpowered_api.validators import current_week_starting
from reference.models import QuestionOption

PIN = "196712"


# End to end test - the whole journey through the real endpoints,
class PatientAndSupporterFlowTests(APITestCase):

    def setUp(self):
        cache.clear()
        call_command("seed_options", stdout = StringIO())

    def sign_up(self, phone, name, **extra):
        # Request-code, verify-code then register, returns token
        with mock.patch("accounts.otp.create_otp", return_value = "123456"):
            self.client.post("/auth/request-code", {"phone_number": phone}, format = "json")
        verification = self.client.post("/auth/verify-code", {"phone_number": phone, "otp": "123456"}, format = "json")

        response = self.client.post("/auth/register", {
            "verification_id": verification.data["verification_id"], "phone_number": phone, "display_name": name,
            "pin": PIN, "accepted_terms": True, "accepted_privacy": True, "device_id": f"{name}-phone", **extra,
        }, format = "json")
        self.assertEqual(response.status_code, 201)
        return response.data["token"]

    def use_token(self, token):
        self.client.credentials(HTTP_AUTHORIZATION = f"Token {token}")

    def test_patient_shares_assessment_with_supporter(self):
        # Patient signs up tracking their health and fills in this week's pain
        pain_type = QuestionOption.objects.filter(question_key = "pain_type").first()
        patient_token = self.sign_up("0490 813 123", "Josh", track_health = True, health = {"pain_types": [str(pain_type.pk)]})
        self.use_token(patient_token)

        assessment = self.client.post("/api/assessment/", {"week_starting": str(current_week_starting())}, format = "json").data
        response = self.client.post("/api/myPain/", {"assessment": assessment["id"], "current": 4, "worst": 7, "average": 5, "mildest": 2}, format = "json")
        self.assertEqual(response.status_code, 201)

        # Invites someone who hasn't got the app yet and allows viewing assessments
        response = self.client.post("/api/supportLink/", {"invited_phone_number": "0422 222 222", "can_view_assessments": True}, format = "json")
        self.assertEqual(response.status_code, 201)

        # They sign up with that number and accept
        self.client.credentials()
        self.use_token(self.sign_up("0422 222 222", "Mum"))
        link = self.client.get("/api/supportLink/").data[0]
        response = self.client.patch(f"/api/supportLink/{link['id']}", {"status": "active"}, format = "json")
        self.assertEqual(response.status_code, 200)

        # Supporter can read the assessment and trends but not prescriptions
        self.assertEqual(self.client.get(f"/api/assessment/{assessment['id']}").status_code, 200)
        trend = self.client.get(f"/api/painTrend/?patient_profile={link['patient_profile']}").data
        self.assertEqual(trend[0]["worst"], 7)
        self.assertEqual(self.client.get(f"/api/prescription/?patient_profile={link['patient_profile']}").data, [])

        # Patient can see that the supporter opened it
        self.use_token(patient_token)
        actions = [entry["action"] for entry in self.client.get("/api/auditEntry/").data]
        self.assertIn("view", actions)