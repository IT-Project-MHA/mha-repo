from django.db import models
from django.utils import timezone

from mpowered_api.base_models import BaseModel

class AuditEntry(BaseModel):
    class Action(models.TextChoices):
        VIEW = "view", "Viewed"
        CREATE = "create", "Created"
        UPDATE = "update", "Updated"
        DELETE = "delete", "Deleted"
        EXPORT = "export", "Exported or printed"
        SHARE = "share", "Shared"
        GRANT = "grant", "Access granted"
        REVOKE = "revoke", "Access revoked"

    class Target(models.TextChoices):
        ASSESSMENT = "assessment", "Assessment"
        PRESCRIPTION = "prescription", "Prescription"
        APPOINTMENT = "appointment", "Appointment"
        APPOINTMENT_QUESTION = "appointment_question", "Appointment Question"
        APPOINTMENT_ANSWER = "appointment_answer", "Appointment Answer"
        APPOINTMENT_ACCESS = "appointment_access", "Appointment Access"
        SUPPORT_LINK = "support_link", "Support Link"
        PATIENT_PROFILE = "patient_profile", "Patient Profile"
        PAIN_CHART = "pain_chart", "Pain Chart"
        PAIN_PROFILE = "pain_profile", "Pain Profile"

    audit_user = models.ForeignKey("accounts.User", on_delete = models.SET_NULL, null = True, blank = True)
    audit_label = models.CharField(blank = True)
    patient_profile = models.ForeignKey("accounts.PatientProfile", on_delete = models.SET_NULL, null = True, blank = True)

    action = models.CharField(choices = Action.choices)
    target_type = models.CharField(max_length = 40, choices = Target.choices)
    target_id = models.UUIDField(null = True, blank = True)

    occurred_at = models.DateTimeField(default = timezone.now, db_index = True)
    context = models.JSONField(default = dict, blank = True)

    class Meta:
        db_table = "audit_entry"
        ordering = ["-occurred_at"]
        indexes = [
            # All audit logs for this person, sorted by newest first
            models.Index(fields = ["patient_profile", "-occurred_at"], name = "audit_by_patient_idx"),
        ]
