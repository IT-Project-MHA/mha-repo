from rest_framework.authtoken.models import Token

from accounts import devices
from accounts.models import User
from accounts.registration import check_verification


class LoginError(Exception):
    # Login refused
    def __init__(self, reason):
        super().__init__(reason)
        self.reason = reason


def find_user(phone_number):
    # Find account for phone number
    return User.objects.filter(phone_number = phone_number, deleted_at__isnull = True, is_active = True).first()


def login_user(phone_number, pin, device_id, verification_id = None):

    # Check phone, pin and device
    # New devices need a verification_id from verify code
    # Returns user and token raises LoginError if error

    user = find_user(phone_number)

    if user is None:
        raise LoginError("invalid_credentials")

    if not user.check_password(pin):
        raise LoginError("invalid_credentials")

    if not devices.is_trusted(user, device_id):
        if verification_id is None:
            raise LoginError("verification_required")

        if not check_verification(verification_id, phone_number):
            raise LoginError("verification_invalid")


    devices.trust_device(user, device_id)

    # One token per user
    token, _ = Token.objects.get_or_create(user = user)

    return user, token


def logout_user(user):
    # Delete the token and sign out on every device
    Token.objects.filter(user = user).delete()