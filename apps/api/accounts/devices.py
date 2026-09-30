from accounts.models import TrustedDevice


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