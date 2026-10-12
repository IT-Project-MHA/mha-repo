from django.utils import timezone

# helper function: marks as deleted instead of removing database row
# Thus past assessments and audit entries still point at something.
def soft_delete(instance):
    instance.deleted_at = timezone.now()
    instance.save(update_fields = ["deleted_at", "updated_at"])