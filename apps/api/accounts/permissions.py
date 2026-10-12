from rest_framework.permissions import SAFE_METHODS, BasePermission
from django.db.models import Q

from accounts.models import SupportLink, PatientProfile
from appointment.models import AppointmentAccess, Appointment
from health.models import Prescription, Assessment
from audit.models import AuditEntry


def is_owner(user, patient_profile):
    # true if user's own patient record
    return patient_profile.user_id == user.id


def supporter_allowed(user, patient_profile, **switches):
    # True if user has an active support link to this patient with switches on
    return SupportLink.objects.filter(
        patient_profile = patient_profile,
        supporter_user = user,
        status = SupportLink.Status.ACTIVE,
        **switches
    ).exists()


def has_access(user, appointment, **flags):
    # True if user has a live access for this appointment through active support link
    return AppointmentAccess.objects.filter(
        appointment = appointment,
        support_link__supporter_user = user,
        support_link__status = SupportLink.Status.ACTIVE,
        revoked_at__isnull = True,
        **flags
    ).exists()


def can_view_assessments(user, patient_profile):
    return is_owner(user, patient_profile) or supporter_allowed(user, patient_profile, can_view_assessments = True)


def can_view_prescriptions(user, patient_profile):
    return is_owner(user, patient_profile) or supporter_allowed(user, patient_profile, can_view_prescriptions = True)


def can_view_appointment(user, appointment):
    patient_profile = appointment.patient_profile

    return (
        is_owner(user, patient_profile)
        or supporter_allowed(user, patient_profile, can_view_appointments = True)
        or has_access(user, appointment)
    )


def can_add_question(user, appointment):
    return is_owner(user, appointment.patient_profile) or has_access(user, appointment, can_add_questions = True)


def can_record_answer(user, appointment):
    return is_owner(user, appointment.patient_profile) or has_access(user, appointment, can_record_answers = True)


def can_edit_patient_data(user, patient_profile):
    return is_owner(user, patient_profile)


# Returns set of appointment access records that user can access
def visible_appointment_access(user):
    return AppointmentAccess.objects.filter(
            Q(appointment__patient_profile__user = user) |
            Q(support_link__supporter_user = user)
        )

# Returns set of appointments that user can access (own, or granted access
# through an active support link that hasn't been revoked)
def visible_appointments(user):
    return Appointment.objects.filter(
            Q(patient_profile__user = user) | 
            Q(patient_profile__support_links__supporter_user = user,
              patient_profile__support_links__status = SupportLink.Status.ACTIVE,
              patient_profile__support_links__can_view_appointments = True) |
            Q(access_grants__support_link__supporter_user = user,
              access_grants__support_link__status = SupportLink.Status.ACTIVE,
              access_grants__revoked_at__isnull = True)).filter(deleted_at__isnull = True, patient_profile__deleted_at__isnull = True)


# helper function: returns set of patient profiles that user can access
def visible_patient_profiles(user):
    # filter own profile or profiles of patients that user supports
    return PatientProfile.objects.filter(
            Q(user = user) |
            Q(support_links__supporter_user = user,
              support_links__status = SupportLink.Status.ACTIVE)
        ).filter(deleted_at__isnull = True)


# helper function: returns set of support links that user can access
def visible_support_links(user):
    return SupportLink.objects.filter(Q(patient_user = user) | Q(supporter_user = user))

def visible_prescriptions(user):
    return Prescription.objects.filter(
            Q(patient_profile__user = user) |
            Q(patient_profile__support_links__supporter_user = user,
              patient_profile__support_links__status = SupportLink.Status.ACTIVE,
              patient_profile__support_links__can_view_prescriptions = True)
        )


# helper function: returns set of assessments that user can access
def visible_assessments(user):
    return Assessment.objects.filter(
            Q(patient_profile__user = user) |
            Q(patient_profile__support_links__supporter_user = user,
              patient_profile__support_links__status = SupportLink.Status.ACTIVE,
              patient_profile__support_links__can_view_assessments = True)).filter(patient_profile__deleted_at__isnull = True)


def visible_audit_entries(user):
    return AuditEntry.objects.filter(Q(audit_user = user) | Q(patient_profile__user = user))