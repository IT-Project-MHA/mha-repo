from datetime import date, timedelta

from rest_framework.test import APITestCase

from accounts.models import PatientProfile, SupportLink, User
from health.models import Assessment, Prescription, MyPain
from mpowered_api.validators import current_week_starting
from reference.models import QuestionOptionOrdered, QuestionOption
from audit.models import AuditEntry

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


# Prescriptions, assessments, scores, pain insights and audit tests
class HealthRecordTests(APITestCase):

    def setUp(self):
        self.patient = User.objects.create_user("+61490813123", "Josh", PIN)
        self.profile = PatientProfile.objects.create(user = self.patient)
        self.prescription = Prescription.objects.create(patient_profile = self.profile, name = "Panadol", dosage = 2,
                                                        frequency = 4)
        self.assessment = Assessment.objects.create(patient_profile = self.profile, week_starting = current_week_starting())
        self.supporter = User.objects.create_user("+61411111111", "Mum", PIN)
        self.link = SupportLink.objects.create(
            patient_profile = self.profile, patient_user = self.patient, supporter_user = self.supporter,
            status = SupportLink.Status.ACTIVE,
        )
        self.client.force_authenticate(self.patient)

    def option(self, question_key, score):
        return QuestionOptionOrdered.objects.create(question_key = question_key, text = "Option", option_number = 1,
                                                    score = score)

    def test_deleted_prescription_hidden_but_still_opens(self):
        self.assertEqual(self.client.delete(f"/api/prescription/{self.prescription.pk}").status_code, 204)
        self.assertEqual(len(self.client.get("/api/prescription/").data), 0)
        self.assertEqual(self.client.get(f"/api/prescription/{self.prescription.pk}").status_code, 200)

    def test_prescription_create_is_audited(self):
        response = self.client.post("/api/prescription/", {"name": "Ibuprofen", "dosage": 1, "frequency": 8}, format = "json")
        self.assertEqual(response.status_code, 201)
        self.assertTrue(AuditEntry.objects.filter(action = AuditEntry.Action.CREATE, target_type = "prescription").exists())

    def test_prescription_update_is_audited(self):
        self.client.patch(f"/api/prescription/{self.prescription.pk}", {"dosage": 3}, format = "json")
        self.assertTrue(AuditEntry.objects.filter(action = AuditEntry.Action.UPDATE, target_type = "prescription").exists())

    def test_prescription_stop_before_start(self):
        response = self.client.post("/api/prescription/", {"name": "Ibuprofen", "dosage": 1, "frequency": 8,
                                                           "started_on": "2026-10-10", "stopped_on": "2026-10-01"},
                                    format = "json")
        self.assertEqual(response.status_code, 400)

    def test_supporter_view_is_audited(self):
        SupportLink.objects.filter(pk = self.link.pk).update(can_view_prescriptions = True)
        self.client.force_authenticate(self.supporter)
        self.client.get(f"/api/prescription/{self.prescription.pk}")
        self.assertTrue(AuditEntry.objects.filter(action = AuditEntry.Action.VIEW, audit_user = self.supporter).exists())

    def test_own_view_not_audited(self):
        self.client.get(f"/api/prescription/{self.prescription.pk}")
        self.assertFalse(AuditEntry.objects.filter(action = AuditEntry.Action.VIEW).exists())

    def test_week_cannot_be_in_the_future(self):
        response = self.client.post("/api/assessment/", {"week_starting": str(current_week_starting() + timedelta(days = 7))},
                                    format = "json")
        self.assertEqual(response.status_code, 400)

    def test_one_assessment_per_week(self):
        response = self.client.post("/api/assessment/", {"week_starting": str(current_week_starting())}, format = "json")
        self.assertEqual(response.status_code, 400)

    def test_section_needs_own_assessment(self):
        self.client.force_authenticate(self.supporter)
        response = self.client.post("/api/myPain/", {"assessment": str(self.assessment.pk), "worst": 3}, format = "json")
        self.assertEqual(response.status_code, 400)

    def test_section_list_needs_assessment(self):
        self.assertEqual(self.client.get("/api/myPain/").status_code, 400)

    def test_movement_score(self):
        walking = self.option("movement_walking", 2)
        sitting = self.option("movement_sitting", 3)
        response = self.client.post("/api/myMovement/", {"assessment": str(self.assessment.pk), "walking": str(walking.pk),
                                                         "sitting": str(sitting.pk)}, format = "json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["score"], 5)

    def test_personal_care_score(self):
        sleeping = self.option("care_sleeping", 4)
        response = self.client.post("/api/myPersonalCare/", {"assessment": str(self.assessment.pk),
                                                             "sleeping": str(sleeping.pk)}, format = "json")
        self.assertEqual(response.data["score"], 4)

    def test_social_health_score(self):
        mood = self.option("social_overall_mood", 3)
        response = self.client.post("/api/mySocialHealth/", {"assessment": str(self.assessment.pk),
                                                             "overall_mood": str(mood.pk)}, format = "json")
        self.assertEqual(response.data["score"], 3)

    def test_management_score(self):
        exercise = self.option("management_exercise", 2)
        response = self.client.post("/api/myManagement/", {"assessment": str(self.assessment.pk),
                                                           "exercise": str(exercise.pk)}, format = "json")
        self.assertEqual(response.data["score"], 2)

    def test_section_update_is_audited(self):
        pain = MyPain.objects.create(assessment = self.assessment, worst = 7)
        self.client.patch(f"/api/myPain/{pain.pk}", {"current": 4}, format = "json")
        self.assertTrue(AuditEntry.objects.filter(action = AuditEntry.Action.UPDATE, target_type = "assessment").exists())

    def test_pain_trend(self):
        MyPain.objects.create(assessment = self.assessment, current = 4, worst = 7)
        response = self.client.get("/api/painTrend/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data[0]["worst"], 7)

    def test_pain_profile(self):
        MyPain.objects.create(assessment = self.assessment, current = 4, worst = 7)
        response = self.client.get("/api/painProfile/")
        self.assertEqual(response.status_code, 200)

    def test_supporter_without_switch_gets_no_trend(self):
        MyPain.objects.create(assessment = self.assessment, current = 4, worst = 7)
        self.client.force_authenticate(self.supporter)
        response = self.client.get(f"/api/painTrend/?patient_profile={self.profile.pk}")
        self.assertEqual(response.data, [])


# Pain Trend Tests 
class PainTrendTests(APITestCase):
    # GET /api/painTrend/

    def setUp(self):
        self.patient = User.objects.create_user("+61490813123", "Josh", PIN)
        self.profile = PatientProfile.objects.create(user = self.patient)
        self.client.force_authenticate(self.patient)

        self.back = QuestionOption.objects.create(app_section = "my_pain", question_key = "pain_location", text = "Lower back")
        self.neck = QuestionOption.objects.create(app_section = "my_pain", question_key = "pain_location", text = "Neck")

        # Neck two weeks ago, back last week
        self.add_week(2, self.neck)
        self.add_week(1, self.back)

    def add_week(self, weeks_ago, location):
        assessment = Assessment.objects.create(patient_profile = self.profile,
                                               week_starting = current_week_starting() - timedelta(weeks = weeks_ago))
        pain = MyPain.objects.create(assessment = assessment, current = weeks_ago)
        pain.locations.add(location)

    def test_trend_includes_locations(self):
        response = self.client.get("/api/painTrend/")
        self.assertEqual([week["locations"] for week in response.data], [["Neck"], ["Lower back"]])

    def test_filter_by_location(self):
        response = self.client.get(f"/api/painTrend/?location={self.back.id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["locations"], ["Lower back"])

    def test_location_with_no_weeks(self):
        hip = QuestionOption.objects.create(app_section = "my_pain", question_key = "pain_location", text = "Hip")
        self.assertEqual(self.client.get(f"/api/painTrend/?location={hip.id}").data, [])


# Assessment Search Tests
class AssessmentSearchTests(APITestCase):
    # GET /api/assessment/?search=&from=&to=

    def setUp(self):
        self.patient = User.objects.create_user("+61490813123", "Josh", PIN)
        self.profile = PatientProfile.objects.create(user = self.patient)
        self.client.force_authenticate(self.patient)

        self.recent = Assessment.objects.create(patient_profile = self.profile, reflection = "Gardening hurt",
                                                week_starting = current_week_starting() - timedelta(weeks = 1))
        MyPain.objects.create(assessment = self.recent, current = 4)

        self.older = Assessment.objects.create(patient_profile = self.profile, reflection = "Good week",
                                               week_starting = current_week_starting() - timedelta(weeks = 3))

    def test_search_pain_area(self):
        neck = QuestionOption.objects.create(app_section = "my_pain", question_key = "pain_location", text = "Neck")
        self.recent.my_pain.locations.add(neck)
        self.assertEqual(len(self.client.get("/api/assessment/?search=neck").data), 1)

    def test_search_no_match(self):
        self.assertEqual(self.client.get("/api/assessment/?search=swimming").data, [])

    def test_date_range(self):
        two_weeks_ago = current_week_starting() - timedelta(weeks = 2)
        self.assertEqual(len(self.client.get(f"/api/assessment/?from={two_weeks_ago}").data), 1)
        self.assertEqual(len(self.client.get(f"/api/assessment/?to={two_weeks_ago}").data), 1)