from django.utils import timezone
from rest_framework.authtoken.models import Token
from accounts.models import TrustedDevice, PushToken, DeviceToken


def is_trusted(user, device_id):
    # True if device has been verified before and not revoked
    return TrustedDevice.objects.filter(user = user, device_id = device_id, revoked_at__isnull = True).exists()


def trust_device(user, device_id):
    # Remember this device so it can skip otp
    # Also unrevokes a device
    device, _ = TrustedDevice.objects.update_or_create(
        user = user,
        device_id = device_id,
        defaults = {"revoked_at": None},
    )

    return device


def sign_in(user, device_id):
    device = trust_device(user, device_id)
    DeviceToken.objects.filter(device = device).delete()
    return DeviceToken.objects.create(user = user, device = device)

def sign_out_everywhere(user):
    DeviceToken.objects.filter(user = user).delete()
    PushToken.objects.filter(user = user).delete()


def list_devices(user):
    # All unrevoked devices logged in with most recent first
    return TrustedDevice.objects.filter(user = user, revoked_at__isnull = True).order_by("-last_seen_at")


def revoke_device(user, device_pk):
    # Revoke device and returns false if device not theirs

    device = TrustedDevice.objects.filter(user = user, pk = device_pk).first()

    if device is None:
        return False

    if device.revoked_at is None:
        device.revoked_at = timezone.now()
        device.save(update_fields = ["revoked_at"])

    DeviceToken.objects.filter(device = device).delete()
    PushToken.objects.filter(device = device).delete()

    return True