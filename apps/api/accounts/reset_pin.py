from django.db import transaction
from django.utils import timezone
from rest_framework.authtoken.models import Token

from accounts import devices
from accounts.models import TrustedDevice
from accounts.login import find_user
from accounts.registration import check_verification


class PinResetError(Exception):
    # PIN reset refused
    def __init__(self, reason):
        super().__init__(reason)
        self.reason = reason


def reset_pin(phone_number, verification_id, pin, device_id):

    # Set new PIN once the phone has passed the otp again
    # Signs out every device but signs in the one doing the reset
    # Returns user and token and PinResetError if errors

    if not check_verification(verification_id, phone_number):
        raise PinResetError("verification_invalid")

    user = find_user(phone_number)

    if user is None:
        raise PinResetError("no_account")

    with transaction.atomic():
        user.set_password(pin)
        user.save(update_fields = ["password", "updated_at"])

        # Log out of every device
        TrustedDevice.objects.filter(user = user, revoked_at__isnull = True).update(revoked_at = timezone.now())
        Token.objects.filter(user = user).delete()

        # Phone just passed the otp so it stays signed in
        devices.trust_device(user, device_id)
        token = Token.objects.create(user = user)

    return user, token