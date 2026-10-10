from rest_framework.permissions import SAFE_METHODS, BasePermission

from accounts.models import SupportLink
from appointment.models import AppointmentAccess


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
    # True if user has a live access for this appointment through an active support link
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


class PatientRecordPermission(BasePermission):
    # Base for views of one patient's records
    # Reads use can_view and writes are patient only

    def can_view(self, user, record):
        return False

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return self.can_view(request.user, obj)

        return can_edit_patient_data(request.user, obj.patient_profile)


class AssessmentPermission(PatientRecordPermission):
    def can_view(self, user, record):
        return can_view_assessments(user, record.patient_profile)


class PrescriptionPermission(PatientRecordPermission):
    def can_view(self, user, record):
        return can_view_prescriptions(user, record.patient_profile)


class AppointmentPermission(PatientRecordPermission):
    def can_view(self, user, record):
        return can_view_appointment(user, record)