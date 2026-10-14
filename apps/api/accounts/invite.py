from django.utils import timezone

from accounts.models import SupportLink, User
from accounts.phone_normaliser import normalise_phone_number
from accounts.sms import send_sms

from audit.models import AuditEntry
from audit.services import record

PERMISSIONS = ["can_view_assessments", "can_view_prescriptions", "can_view_appointments"]


class InviteError(Exception):
    # Invite refused    
    def __init__(self, reason):
        super().__init__(reason)
        self.reason = reason


def invite_supporter(patient_user, patient_profile, phone_number, permissions):

    # Invite a support person by phone number and links straight to their account, otherwise texts them and the invite
    # is linked when they sign up with that number

    phone_number = normalise_phone_number(phone_number or "")
    if phone_number is None:
        raise InviteError("invalid_phone")
    if phone_number == patient_user.phone_number:
        raise InviteError("invalid_invite_self")

    supporter = User.objects.filter(phone_number = phone_number, deleted_at__isnull = True, is_active = True).first()

    if supporter is not None:
        link = SupportLink.objects.filter(patient_profile = patient_profile, supporter_user = supporter).first()
    else:
        link = SupportLink.objects.filter(patient_profile = patient_profile, supporter_user__isnull = True,
                                          invited_phone_number = phone_number).first()

    if link is not None and link.status != SupportLink.Status.REVOKED:
        raise InviteError("already_invited")

    # Revoked link is reused
    if link is None:
        link = SupportLink(patient_profile = patient_profile, patient_user = patient_user, supporter_user = supporter)

    link.invited_phone_number = phone_number
    link.status = SupportLink.Status.INVITED
    link.invited_at = timezone.now()
    link.accepted_at = None
    link.revoked_at = None

    for switch in PERMISSIONS:
        setattr(link, switch, permissions.get(switch, False))

    link.save()
    record(patient_user, AuditEntry.Action.SHARE, link)

    if supporter is None:
            send_sms(phone_number, "You've been invited to be a support person on MPOWERED. Sign up in the app with this number to accept.")
    return link


def link_pending_invites(user):
    # Invites sent to a number before it had an account get attached to the new account

    SupportLink.objects.filter(
        invited_phone_number = user.phone_number,
        supporter_user__isnull = True,
        status = SupportLink.Status.INVITED,
    ).exclude(patient_user = user).update(supporter_user = user)