from django.utils import timezone

from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from accounts import permissions
from accounts.models import PatientProfile, SupportLink, User
from appointment.models import Appointment, AppointmentAccess

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

        # Supporter has accepted
        self.supporter, self.link = self.add_supporter("+61411111111", SupportLink.Status.ACTIVE)

    def sign_in(self, user):
        token, _ = Token.objects.get_or_create(user = user)
        self.client.credentials(HTTP_AUTHORIZATION = f"Token {token.key}")

    def add_supporter(self, phone, status):
        supporter = User.objects.create_user(phone, "Supporter", PIN)
        link = SupportLink.objects.create(patient_profile = self.profile, patient_user = self.patient, 
                                          supporter_user = supporter, status = status
        )
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

    def test_supporter_must_accept_invite_first(self):
        _, invited_link = self.add_supporter("+61422222222", SupportLink.Status.INVITED)
        response = self.grant(invited_link, can_add_questions = True)
        self.assertEqual(response.data["detail"], "link_not_active")
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
        _, invited_link = self.add_supporter("+61422222222", SupportLink.Status.INVITED)
        self.grant(invited_link)
        self.assertFalse(AuditEntry.objects.exists())