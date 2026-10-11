from django.utils import timezone

from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from accounts import permissions
from accounts.models import PatientProfile, SupportLink, User
from appointment.models import Appointment, AppointmentAccess, AppointmentAnswer, AppointmentQuestion

from audit.models import AuditEntry

PIN = "196712"

# Grant Tests
class GrantAccessTests(APITestCase):
    # POST /appointments/{id}/access
    # POST /appointments/{id}/access/{grantid}/revoke

    def setUp(self):
        self.patient = User.objects.create_user("+61490813123", "Josh", PIN)
        self.profile = PatientProfile.objects.create(user = self.patient)
        self.appointment = Appointment.objects.create(
            patient_profile = self.profile, scheduled_date = timezone.now(), created_by = self.patient,
        )
        self.sign_in(self.patient)

        # Supporter accepted
        self.supporter, self.link = self.add_supporter("+61411111111", SupportLink.Status.ACTIVE)

    def sign_in(self, user):
        token, _ = Token.objects.get_or_create(user = user)
        self.client.credentials(HTTP_AUTHORIZATION = f"Token {token.key}")

    def add_supporter(self, phone, status):
        supporter = User.objects.create_user(phone, "Supporter", PIN)
        link = SupportLink.objects.create(patient_profile = self.profile, patient_user = self.patient, 
                                          supporter_user = supporter, status = status)
        return supporter, link

    def grant(self, link, **flags):
        body = {"support_link_id": str(link.id)}
        body.update(flags)
        return self.client.post(f"/appointments/{self.appointment.id}/access", body, format = "json")

    def revoke(self, grant_id):
        return self.client.post(f"/appointments/{self.appointment.id}/access/{grant_id}/revoke")

    def test_grant_access(self):
        response = self.grant(self.link, can_add_questions = True)
        self.assertEqual(response.status_code, 201)
        grant = AppointmentAccess.objects.get()
        self.assertTrue(grant.can_add_questions)
        self.assertFalse(grant.can_record_answers)

    def test_grant_allows_supporter_to_add_questions(self):
        self.grant(self.link, can_add_questions = True)
        self.assertTrue(permissions.can_add_question(self.supporter, self.appointment))
        self.assertFalse(permissions.can_record_answer(self.supporter, self.appointment))

    def test_granting_again_updates_flags(self):
        self.grant(self.link, can_add_questions = True)
        response = self.grant(self.link, can_add_questions = True, can_record_answers = True)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(AppointmentAccess.objects.count(), 1)
        self.assertTrue(AppointmentAccess.objects.get().can_record_answers)

    def test_invited_link_can_be_granted_but_has_no_access_yet(self):
        invited, invited_link = self.add_supporter("+61422222222", SupportLink.Status.INVITED)
        response = self.grant(invited_link, can_add_questions = True)
        self.assertEqual(response.status_code, 201)
        self.assertFalse(permissions.can_add_question(invited, self.appointment))

        # starts working once the link is active
        SupportLink.objects.filter(pk = invited_link.pk).update(status = SupportLink.Status.ACTIVE)
        self.assertTrue(permissions.can_add_question(invited, self.appointment))

    def test_revoked_link_cannot_be_granted(self):
        _, revoked_link = self.add_supporter("+61422222222", SupportLink.Status.REVOKED)
        response = self.grant(revoked_link, can_add_questions = True)
        self.assertEqual(response.data["detail"], "link_revoked")
        self.assertFalse(AppointmentAccess.objects.exists())

    def test_support_link_for_another_patient(self):
        other_patient = User.objects.create_user("+61433333333", "Other", PIN)
        other_profile = PatientProfile.objects.create(user = other_patient)
        other_link = SupportLink.objects.create(
            patient_profile = other_profile, patient_user = other_patient,
            supporter_user = self.supporter, status = SupportLink.Status.ACTIVE,
        )
        response = self.grant(other_link)
        self.assertEqual(response.data["detail"], "link_not_found")

    def test_only_a_patient_can_grant(self):
        self.sign_in(self.supporter)
        response = self.grant(self.link, can_add_questions = True)
        self.assertEqual(response.status_code, 404)

    def test_revoke_keeps_row(self):
        grant_id = self.grant(self.link, can_add_questions = True).data["id"]
        response = self.revoke(grant_id)
        self.assertEqual(response.status_code, 204)
        grant = AppointmentAccess.objects.get()
        self.assertIsNotNone(grant.revoked_at)
        self.assertFalse(permissions.can_add_question(self.supporter, self.appointment))

    def test_grant_again_after_revoke_keeps_history(self):
        grant_id = self.grant(self.link).data["id"]
        self.revoke(grant_id)
        self.grant(self.link, can_record_answers = True)
        self.assertEqual(AppointmentAccess.objects.count(), 2)
        self.assertEqual(AppointmentAccess.objects.filter(revoked_at__isnull = True).count(), 1)

    def test_revoke_twice(self):
        grant_id = self.grant(self.link).data["id"]
        self.revoke(grant_id)
        self.assertEqual(self.revoke(grant_id).status_code, 404)

    def test_needs_login(self):
        self.client.credentials()
        self.assertEqual(self.grant(self.link).status_code, 401)

    def test_revoke_needs_login(self):
        grant_id = self.grant(self.link).data["id"]
        self.client.credentials()
        self.assertEqual(self.revoke(grant_id).status_code, 401)
        self.assertIsNone(AppointmentAccess.objects.get().revoked_at)

# Audit Tests

    def test_grant_is_audited(self):
        self.grant(self.link, can_add_questions = True)
        entry = AuditEntry.objects.get()
        self.assertEqual(entry.action, AuditEntry.Action.GRANT)
        self.assertEqual(entry.target_type, AuditEntry.Target.APPOINTMENT_ACCESS)
        self.assertEqual(entry.audit_user, self.patient)
        self.assertEqual(entry.patient_profile, self.profile)

    def test_change_is_audited(self):
        self.grant(self.link)
        self.grant(self.link, can_record_answers = True)
        actions = list(AuditEntry.objects.order_by("occurred_at").values_list("action", flat = True))
        self.assertEqual(actions, [AuditEntry.Action.GRANT, AuditEntry.Action.UPDATE])

    def test_revoke_audited(self):
        grant_id = self.grant(self.link).data["id"]
        self.revoke(grant_id)
        self.assertTrue(AuditEntry.objects.filter(action = AuditEntry.Action.REVOKE).exists())

    def test_refused_grant_not_audited(self):
        _, revoked_link = self.add_supporter("+61422222222", SupportLink.Status.REVOKED)
        self.grant(revoked_link)
        self.assertFalse(AuditEntry.objects.exists())


class AppointmentSwitchTests(APITestCase):

    def setUp(self):
        self.patient = User.objects.create_user("+61490813123", "Josh", PIN)
        self.profile = PatientProfile.objects.create(user = self.patient)
        self.appointment = Appointment.objects.create(patient_profile = self.profile, scheduled_date = timezone.now(), created_by = self.patient)

        # Active link with every switch off and no grants
        self.supporter = User.objects.create_user("+61411111111", "Mum", PIN)
        self.link = SupportLink.objects.create(
            patient_profile = self.profile,
            patient_user = self.patient,
            supporter_user = self.supporter,
            status = SupportLink.Status.ACTIVE,
        )
        self.client.force_authenticate(self.supporter)

    def update_link(self, **changes):
        SupportLink.objects.filter(pk = self.link.pk).update(**changes)

    def test_hidden_when_switch_off(self):
        self.assertEqual(len(self.client.get("/api/appointment/").data), 0)
        self.assertEqual(self.client.get(f"/api/appointment/{self.appointment.pk}").status_code, 404)

    def test_shown_when_switch_on(self):
        self.update_link(can_view_appointments = True)
        self.assertEqual(len(self.client.get("/api/appointment/").data), 1)
        self.assertEqual(self.client.get(f"/api/appointment/{self.appointment.pk}").status_code, 200)

    def test_grant_still_works_with_switch_off(self):
        AppointmentAccess.objects.create(appointment = self.appointment, support_link = self.link)
        self.assertEqual(len(self.client.get("/api/appointment/").data), 1)

    def test_hidden_once_link_revoked(self):
        self.update_link(can_view_appointments = True, status = SupportLink.Status.REVOKED)
        self.assertEqual(len(self.client.get("/api/appointment/").data), 0)

    def test_switch_does_not_allow_editing(self):
        self.update_link(can_view_appointments = True)
        response = self.client.patch(f"/api/appointment/{self.appointment.pk}", {"doctor": "Dr Who"}, format = "json")
        self.assertEqual(response.status_code, 404)

# Soft delete tests
class SoftDeleteTests(APITestCase):
    # DELETE /api/appointment/{id}, /api/appointmentQuestion/{id}, /api/appointmentAnswer/{id}

    def setUp(self):
        # Patient with an answered question and a supporter given access
        self.patient = User.objects.create_user("+61490813123", "Josh", PIN)
        self.profile = PatientProfile.objects.create(user = self.patient)
        self.appointment = Appointment.objects.create(
            patient_profile = self.profile, scheduled_date = timezone.now(), created_by = self.patient,
        )
        self.question = AppointmentQuestion.objects.create(
            appointment = self.appointment, text = "Why?", created_by = self.patient,
        )
        self.answer = AppointmentAnswer.objects.create(
            question = self.question, text = "Because", recorded_by = self.patient,
        )
        self.supporter = User.objects.create_user("+61411111111", "Mum", PIN)
        self.link = SupportLink.objects.create(
            patient_profile = self.profile, patient_user = self.patient,
            supporter_user = self.supporter, status = SupportLink.Status.ACTIVE,
        )
        self.access = AppointmentAccess.objects.create(appointment = self.appointment, support_link = self.link)
        self.client.force_authenticate(self.patient)

    def refresh(self):
        for record in (self.appointment, self.question, self.answer):
            record.refresh_from_db()

    def test_delete_appointment_soft_deletes_questions_and_answers(self):
        response = self.client.delete(f"/api/appointment/{self.appointment.pk}")
        self.assertEqual(response.status_code, 204)
        self.refresh()
        self.assertTrue(self.appointment.is_deleted())
        self.assertTrue(self.question.is_deleted())
        self.assertTrue(self.answer.is_deleted())

    def test_appointment_with_access_can_be_deleted(self):
        # access is kept as a record, it used to stop the appointment being deleted
        self.client.delete(f"/api/appointment/{self.appointment.pk}")
        self.assertTrue(AppointmentAccess.objects.filter(pk = self.access.pk).exists())

    def test_deleted_appointment_hidden(self):
        self.client.delete(f"/api/appointment/{self.appointment.pk}")
        self.assertEqual(len(self.client.get("/api/appointment/").data), 0)
        self.assertEqual(self.client.get(f"/api/appointment/{self.appointment.pk}").status_code, 404)
        self.assertEqual(len(self.client.get(f"/api/appointmentQuestion/?appointment={self.appointment.pk}").data), 0)
        self.assertEqual(len(self.client.get(f"/api/appointmentAnswer/?question={self.question.pk}").data), 0)
        self.assertEqual(len(self.client.get("/api/appointmentAccess/").data), 0)

    def test_deleted_appointment_hidden_from_supporter(self):
        self.client.delete(f"/api/appointment/{self.appointment.pk}")
        self.client.force_authenticate(self.supporter)
        self.assertEqual(len(self.client.get("/api/appointment/").data), 0)

    def test_deleted_appointment_cannot_be_changed(self):
        self.client.delete(f"/api/appointment/{self.appointment.pk}")
        response = self.client.patch(f"/api/appointment/{self.appointment.pk}", {"doctor": "Dr Who"}, format = "json")
        self.assertEqual(response.status_code, 404)

    def test_cannot_add_question_to_deleted_appointment(self):
        self.client.delete(f"/api/appointment/{self.appointment.pk}")
        response = self.client.post("/api/appointmentQuestion/", {
            "appointment": str(self.appointment.pk), "text": "Another?",
        }, format = "json")
        self.assertEqual(response.status_code, 400)

    def test_delete_question_soft_deletes_answer(self):
        response = self.client.delete(f"/api/appointmentQuestion/{self.question.pk}")
        self.assertEqual(response.status_code, 204)
        self.refresh()
        self.assertFalse(self.appointment.is_deleted())
        self.assertTrue(self.question.is_deleted())
        self.assertTrue(self.answer.is_deleted())

    def test_question_order_restarts_after_deleting_all(self):
        self.client.delete(f"/api/appointmentQuestion/{self.question.pk}")
        response = self.client.post("/api/appointmentQuestion/", {
            "appointment": str(self.appointment.pk), "text": "New first?",
        }, format = "json")
        self.assertEqual(response.data["order_index"], 0)

    def test_new_answer_after_deleting_answer(self):
        self.assertEqual(self.client.delete(f"/api/appointmentAnswer/{self.answer.pk}").status_code, 204)
        response = self.client.post("/api/appointmentAnswer/", {
            "question": str(self.question.pk), "text": "Changed my mind",
        }, format = "json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(AppointmentAnswer.objects.get().text, "Changed my mind")

    def test_question_still_has_one_answer(self):
        response = self.client.post("/api/appointmentAnswer/", {
            "question": str(self.question.pk), "text": "Second answer",
        }, format = "json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(AppointmentAnswer.objects.count(), 1)

    def test_deleted_at_cannot_be_set_directly(self):
        self.client.patch(f"/api/appointment/{self.appointment.pk}",
                          {"deleted_at": timezone.now().isoformat()}, format = "json")
        self.refresh()
        self.assertFalse(self.appointment.is_deleted())
