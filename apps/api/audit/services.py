from audit.models import AuditEntry


def record(actor, action, target, *, patient_profile = None, context = None):
    # Write one audit entry.

    return AuditEntry.objects.create(
        audit_user = actor,
        audit_label = getattr(actor, "display_name", "") or "",
        patient_profile = patient_profile,
        action = action,
        target_type = type(target).__name__,
        target_id = target.pk,
        context = context or {},
    )