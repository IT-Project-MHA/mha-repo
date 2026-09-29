import secrets
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.hashers import check_password, make_password
from django.db import transaction
from django.db.models import F
from django.utils import timezone

from accounts.models import PhoneVerification

OTP_LENGTH = 6
OTP_TTL = timedelta(minutes = 5)
MAX_ATTEMPTS = 3

class VerificationError(Exception):
    # Code was rejected

    def __init__(self, reason, attempts_remaining = None):
        super().__init__(reason)
        self.reason = reason
        self.attempts_remaining = attempts_remaining


def create_otp():
    # Random numeric code. Secrets as it must be unguessable.
    return "".join(secrets.choice("0123456789") for _ in range(OTP_LENGTH))


def send_otp(phone_number, code):
    # Send otp to phone number, right now just to console for testing
    if settings.DEBUG:
        print(f"[OTP] {phone_number}: {code}")


def issue_otp(phone_number):
    # Create a new code for phone, store only its hash, and send it.
    otp = create_otp()

    verification = PhoneVerification.objects.create(
        phone_number = phone_number,
        code = make_password(otp),
        expires_at = timezone.now() + OTP_TTL,
    )

    send_otp(phone_number, otp)

    return verification


def usable(verification):
    # Return a VerificationError if otp not useable

    if verification is None:
        return VerificationError("invalid")
    
    if verification.used_at is not None:
        return VerificationError("used")
    
    if verification.attempts >= MAX_ATTEMPTS:
        return VerificationError("locked")
    
    if verification.expires_at <= timezone.now():
        return VerificationError("expired")
    
    return None


def verify_code(phone_number, code):
    
    # Check otp against newest issued for this phone
    # Requesting new code retires the old one.
    # Returns the PhoneVerification on success or VerificationError.
    
    with transaction.atomic():
        # Lock the row so two guesses sent at the same time can't both read the same attempt count
        verification = (
            PhoneVerification.objects.select_for_update()
            .filter(phone_number = phone_number)
            .order_by("-created_at")
            .first()
        )

        error = usable(verification)

        if error is None and not check_password(code, verification.code):
            verification.attempts = F("attempts") + 1
            verification.save(update_fields = ["attempts", "updated_at"])
            verification.refresh_from_db(fields = ["attempts"])
            remaining = MAX_ATTEMPTS - verification.attempts

            error = (
                VerificationError("locked") if remaining <= 0
                else VerificationError("invalid", attempts_remaining = remaining)
            )

        if error is None:
            verification.used_at = timezone.now()
            verification.save(update_fields = ["used_at", "updated_at"])

    if error is not None:
        raise error
    
    return verification