from django.utils import timezone
from django.test import TestCase
from rest_framework.test import APITestCase

from accounts.models import PatientProfile, User, SupportLink
from appointment.access import record_appointment_view, record_question_view
from appointment.models import Appointment, AppointmentAnswer, AppointmentQuestion

from audit.models import AuditEntry
from audit.services import record, record_view

PIN = "196712"

class AuditTests(TestCase):

    def setUp(self):

        self.patient = User.objects.create_user("+61400000000", "Josh", PIN)
        self.profile = PatientProfile.objects.create(user = self.patient)
        self.appointment = Appointment.objects.create(
            patient_profile = self.profile, scheduled_date = timezone.now(), created_by = self.patient
        )
        self.question = AppointmentQuestion.objects.create(
            appointment = self.appointment, text = "Is this normal?", created_by = self.patient
        )
        self.answer = AppointmentAnswer.objects.create(question = self.question, text = "Yes", recorded_by = self.patient)
        self.supporter = User.objects.create_user("+61411111111", "Mum", PIN)

    def test_records_who_and_what(self):
        entry = record(self.supporter, AuditEntry.Action.UPDATE, self.appointment)
        self.assertEqual(entry.audit_user, self.supporter)
        self.assertEqual(entry.audit_label, "Mum")
        self.assertEqual(entry.patient_profile, self.profile)
        self.assertEqual(entry.target_id, self.appointment.id)

    def test_saves_target_type_choice(self):
        entry = record(self.patient, AuditEntry.Action.UPDATE, self.question)
        self.assertEqual(entry.target_type, AuditEntry.Target.APPOINTMENT_QUESTION)

    def test_finds_patient_from_answer(self):
        entry = record(self.patient, AuditEntry.Action.CREATE, self.answer)
        self.assertEqual(entry.patient_profile, self.profile)

    def test_own_view_not_logged(self):
        self.assertIsNone(record_view(self.patient, self.appointment))
        self.assertFalse(AuditEntry.objects.exists())

    def test_someone_elses_view_logged(self):
        entry = record_view(self.supporter, self.appointment)
        self.assertEqual(entry.action, AuditEntry.Action.VIEW)
        self.assertEqual(entry.audit_user, self.supporter)
        self.assertEqual(entry.patient_profile, self.profile)

    def test_appointment_view_by_supporter(self):
        record_appointment_view(self.supporter, self.appointment)
        self.assertTrue(AuditEntry.objects.filter(action = AuditEntry.Action.VIEW).exists())

    def test_appointment_view_by_patient(self):
        record_appointment_view(self.patient, self.appointment)
        self.assertFalse(AuditEntry.objects.exists())

    def test_question_view_by_supporter(self):
        record_question_view(self.supporter, self.question)
        self.assertTrue(AuditEntry.objects.filter(action = AuditEntry.Action.VIEW, target_id = self.question.id).exists())

class AuditEntryApiTests(APITestCase):

    def setUp(self):
        self.patient = User.objects.create_user("+61400000000", "Josh", PIN)
        self.profile = PatientProfile.objects.create(user = self.patient)
        self.supporter = User.objects.create_user("+61411111111", "Mum", PIN)
        self.stranger = User.objects.create_user("+61422222222", "Stranger", PIN)
        link = SupportLink.objects.create(
            patient_profile = self.profile, patient_user = self.patient, supporter_user = self.supporter,
            status = SupportLink.Status.ACTIVE,
        )

        # Supporter viewed the patient's support link
        self.entry = record(self.supporter, AuditEntry.Action.VIEW, link)

    def test_self_cannot_create_entry(self):
        self.client.force_authenticate(self.patient)
        response = self.client.post(
            "/api/auditEntry/", {"action": "view", "target_type": "assessment"}, format = "json"
        )
        self.assertEqual(response.status_code, 405)
        self.assertEqual(AuditEntry.objects.count(), 1)

    def test_patient_sees_entries_about_them(self):
        self.client.force_authenticate(self.patient)
        self.assertEqual(len(self.client.get("/api/auditEntry/").data), 1)
        self.assertEqual(self.client.get(f"/api/auditEntry/{self.entry.pk}").status_code, 200)

    def test_actor_sees_own_entries(self):
        self.client.force_authenticate(self.supporter)
        self.assertEqual(len(self.client.get("/api/auditEntry/").data), 1)

    def test_stranger_sees_no_entries(self):
        self.client.force_authenticate(self.stranger)
        self.assertEqual(len(self.client.get("/api/auditEntry/").data), 0)
        self.assertEqual(self.client.get(f"/api/auditEntry/{self.entry.pk}").status_code, 404)