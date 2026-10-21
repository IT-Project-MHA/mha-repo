from audit.models import AuditEntry
from accounts.models import PatientProfile


# Which audit type each model is saved as
TARGET_TYPES = {
    "Assessment": AuditEntry.Target.ASSESSMENT,
    "Prescription": AuditEntry.Target.PRESCRIPTION,
    "Appointment": AuditEntry.Target.APPOINTMENT,
    "AppointmentQuestion": AuditEntry.Target.APPOINTMENT_QUESTION,
    "AppointmentAnswer": AuditEntry.Target.APPOINTMENT_ANSWER,
    "AppointmentAccess": AuditEntry.Target.APPOINTMENT_ACCESS,
    "SupportLink": AuditEntry.Target.SUPPORT_LINK,
    "PatientProfile": AuditEntry.Target.PATIENT_PROFILE,
}

def record(actor, action, target, *, context = None):
    # Write one audit entry.

    target_type = TARGET_TYPES.get(type(target).__name__)

    if target_type is None:
        raise ValueError(f"No audit type for {type(target).__name__}")

    return AuditEntry.objects.create(
        audit_user = actor,
        audit_label = getattr(actor, "display_name", "") or "",
        patient_profile = find_patient(target),
        action = action,
        target_type = target_type,
        target_id = target.pk,
        context = context or {},
    )

def find_patient(target):
    # Work out whose data this record is by walking up to the patient profile
    if isinstance(target, PatientProfile):
        return target
  
    if hasattr(target, "patient_profile"):
        return target.patient_profile

    if hasattr(target, "appointment"):
        return target.appointment.patient_profile

    if hasattr(target, "question"):
        return target.question.appointment.patient_profile

    return None

def is_someone_elses(actor, target):

    patient_profile = find_patient(target)

    return patient_profile is not None and patient_profile.user_id != actor.id


def record_view(actor, target):

    if not is_someone_elses(actor, target):
        return None

    return record(actor, AuditEntry.Action.VIEW, target)