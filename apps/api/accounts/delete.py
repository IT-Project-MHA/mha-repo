from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from rest_framework.authtoken.models import Token

from accounts.models import PatientProfile, SupportLink, TrustedDevice, DeviceToken


def delete_account(user):

    # Soft delete account allowing the phone number to sign up again

    now = timezone.now()

    with transaction.atomic():
        PatientProfile.objects.filter(user = user, deleted_at__isnull = True).update(deleted_at = now)

        # Lose access and and they stop supporting
        SupportLink.objects.filter(Q(patient_user = user) | Q(supporter_user = user)) \
            .exclude(status = SupportLink.Status.REVOKED) \
            .update(status = SupportLink.Status.REVOKED, revoked_at = now)

        # Sign out all devices
        TrustedDevice.objects.filter(user = user, revoked_at__isnull = True).update(revoked_at = now)
        DeviceToken.objects.filter(user = user).delete()

        user.deleted_at = now
        user.is_active = False
        user.save(update_fields = ["deleted_at", "is_active", "updated_at"])