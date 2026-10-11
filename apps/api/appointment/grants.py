from django.db import transaction
from django.utils import timezone

from accounts.models import SupportLink
from appointment.models import Appointment, AppointmentAccess

from audit.models import AuditEntry
from audit.services import record

class GrantError(Exception):
    # Grant refused
    def __init__(self, reason):
        super().__init__(reason)
        self.reason = reason


def grant_access(appointment, support_link_id, can_add_questions, can_record_answers, actor):

    # Give a supporter access to appointment or update their flags if they already have it
    # The supporter must have accepted the support link first

    with transaction.atomic():
        # Lock appointment so multiple grants at once can't both squeeze past the limit
        Appointment.objects.select_for_update().get(pk = appointment.pk)

        link = SupportLink.objects.filter(pk = support_link_id, patient_profile = appointment.patient_profile).first()

        if link is None:
            raise GrantError("link_not_found")
        
        if link.status != SupportLink.Status.ACTIVE:
            raise GrantError("link_not_active")

        live_grants = AppointmentAccess.objects.filter(appointment = appointment, revoked_at__isnull = True)
        grant = live_grants.filter(support_link = link).first()

        # Already has access so just update what they can do
        if grant is not None:
            grant.can_add_questions = can_add_questions
            grant.can_record_answers = can_record_answers
            grant.save(update_fields = ["can_add_questions", "can_record_answers", "updated_at"])
            record(actor, AuditEntry.Action.UPDATE, grant)
            return grant, False

        grant = AppointmentAccess.objects.create(
            appointment = appointment,
            support_link = link,
            can_add_questions = can_add_questions,
            can_record_answers = can_record_answers,
        )

        record(actor, AuditEntry.Action.GRANT, grant)

    return grant, True


def revoke_access(appointment, grant_pk, actor):

    # Revoke a supporter's access to one appointment or sets revoked instead of deleting so there's a record
    # Returns False if there's no live grant

    grant = AppointmentAccess.objects.filter(pk = grant_pk, appointment = appointment, revoked_at__isnull = True).first()

    if grant is None:
        return False

    with transaction.atomic():
        grant.revoked_at = timezone.now()
        grant.save(update_fields = ["revoked_at", "updated_at"])
        record(actor, AuditEntry.Action.REVOKE, grant)

    return True