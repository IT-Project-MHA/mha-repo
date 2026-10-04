from datetime import date

from django.test import TestCase

from accounts.models import PatientProfile, User
from appointment.access import record_appointment_view, record_question_view
from appointment.models import Appointment, AppointmentAnswer, AppointmentQuestion

from audit.models import AppointmentAccessLog, AuditEntry, QuestionAccessLog
from audit.services import record, record_view

PIN = "196712"

class AuditTests(TestCase):

    def setUp(self):

        self.patient = User.objects.create_user("+61400000000", "Josh", PIN)
        self.profile = PatientProfile.objects.create(user = self.patient)
        self.appointment = Appointment.objects.create(
            patient_profile = self.profile, scheduled_date = date.today(), created_by = self.patient
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
        self.assertTrue(AppointmentAccessLog.objects.filter(support_person = self.supporter).exists())

    def test_appointment_view_by_patient(self):
        record_appointment_view(self.patient, self.appointment)
        self.assertFalse(AuditEntry.objects.exists())
        self.assertFalse(AppointmentAccessLog.objects.exists())

    def test_question_view_by_supporter(self):
        record_question_view(self.supporter, self.question)
        self.assertTrue(QuestionAccessLog.objects.filter(question = self.question, support_person = self.supporter).exists())