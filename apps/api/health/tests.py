from datetime import date

from rest_framework.test import APITestCase

from accounts.models import PatientProfile, SupportLink, User
from health.models import Assessment, Prescription

PIN = "196712"
class SupporterAccessTests(APITestCase):

    def setUp(self):
        self.patient = User.objects.create_user("+61490813123", "Josh", PIN)
        self.profile = PatientProfile.objects.create(user = self.patient)
        self.prescription = Prescription.objects.create(patient_profile = self.profile, name = "Panadol", dosage = 2, frequency = 4)
        self.assessment = Assessment.objects.create(patient_profile = self.profile, week_starting = date(2026, 10, 5))

        # Active link with every switch off
        self.supporter = User.objects.create_user("+61411111111", "Mum", PIN)
        self.link = SupportLink.objects.create(
            patient_profile = self.profile,
            patient_user = self.patient,
            supporter_user = self.supporter,
            status = SupportLink.Status.ACTIVE,
        )
        self.client.force_authenticate(self.supporter)

    def turn_on_all_switches(self, **switches):
        SupportLink.objects.filter(pk = self.link.pk).update(**switches)

    def test_prescriptions_hidden_when_switch_off(self):
        self.assertEqual(len(self.client.get("/api/prescription/").data), 0)
        self.assertEqual(self.client.get(f"/api/prescription/{self.prescription.pk}").status_code, 404)

    def test_prescriptions_shown_when_switch_on(self):
        self.turn_on_all_switches(can_view_prescriptions = True)
        self.assertEqual(len(self.client.get("/api/prescription/").data), 1)
        self.assertEqual(self.client.get(f"/api/prescription/{self.prescription.pk}").status_code, 200)

    def test_assessments_hidden_when_switch_off(self):
        self.assertEqual(len(self.client.get("/api/assessment/").data), 0)
        self.assertEqual(self.client.get(f"/api/assessment/{self.assessment.pk}").status_code, 404)

    def test_assessments_shown_when_switch_on(self):
        self.turn_on_all_switches(can_view_assessments = True)
        self.assertEqual(len(self.client.get("/api/assessment/").data), 1)
        self.assertEqual(self.client.get(f"/api/assessment/{self.assessment.pk}").status_code, 200)

    def test_other_switch_does_not_count(self):
        # Prescriptions switch on should not show assessments
        self.turn_on_all_switches(can_view_prescriptions = True)
        self.assertEqual(len(self.client.get("/api/assessment/").data), 0)

    def test_patient_still_sees_own_data(self):
        self.client.force_authenticate(self.patient)
        self.assertEqual(len(self.client.get("/api/prescription/").data), 1)
        self.assertEqual(len(self.client.get("/api/assessment/").data), 1)