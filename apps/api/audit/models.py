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

    audit_user = models.ForeignKey("accounts.User", on_delete = models.SET_NULL, null = True, blank = True)
    audit_label = models.CharField(blank = True)
    patient_profile = models.ForeignKey("accounts.PatientProfile", on_delete = models.SET_NULL, null = True, blank = True)

    action = models.CharField(choices = Action.choices)
    target_type = models.CharField(max_length = 60)
    target_id = models.UUIDField(null = True, blank = True)

    occurred_at = models.DateTimeField(default = timezone.now, db_index = True)
    context = models.JSONField(default = dict, blank = True)

    class Meta:
        db_table = "audit_entry"
        ordering = ["-occurred_at"]
        indexes = [
            # All audit logs for this person, sorted by newest first
            models.Index(fields = ["patient_profile", "-occurred_at"], name = "audit_by_patient_idx"),
            models.Index(fields = ["actor_user", "-occurred_at"], name = "audit_by_actor_idx"),
        ]

# Access logs

class QuestionAccessLog(BaseModel):
    question = models.ForeignKey("appointment.AppointmentQuestion", on_delete = models.CASCADE, related_name = "question")
    support_person = models.ForeignKey("accounts.User", on_delete = models.CASCADE, related_name = "support person")

    class Meta:
        db_table = "question_access"
        ordering = ["-created_at"]

class AppointmentAccessLog(BaseModel):
    appointment = models.ForeignKey("appointment.Appointment", on_delete = models.CASCADE, related_name = "appointment")
    support_person = models.ForeignKey("accounts.user", on_delete = models.CASCADE, related_name = "support person")

    class Meta:
        db_table = "appointment_access"
        ordering = ["-created_at"]