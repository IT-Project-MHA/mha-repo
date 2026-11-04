import secrets
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.hashers import check_password, make_password
from django.db import transaction
from django.db.models import F
from django.utils import timezone

from accounts.models import PhoneVerification
from accounts import twilio_verify
from accounts.sms import send_sms

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
    return "".join(secrets.choice("0123456789") for _ in range(OTP_LENGTH))


def send_otp(phone_number, code):
    # Send otp to phone number
    send_sms(phone_number, f"Your one time code is {code}. It expires in 5 minutes.")


def using_verify():
    return bool(settings.TWILIO_VERIFY_SERVICE_SID)


def issue_otp(phone_number):
    if using_verify():
        try:
            twilio_verify.start_verification(phone_number)
        except twilio_verify.VerifyError:
            pass
        return None

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


def verify_with_twilio(phone_number, otp):
    try:
        result = twilio_verify.check_verification(phone_number, otp)
    except twilio_verify.VerifyError:
        raise VerificationError("unavailable")

    if result != "approved":
        raise VerificationError(result)

    now = timezone.now()

    return PhoneVerification.objects.create(
        phone_number = phone_number,
        code = "",
        used_at = now,
        expires_at = now + OTP_TTL,
    )


def verify_otp(phone_number, otp):

    # Check otp against newest for this phone, requesting new code retires the old one.
    # Returns the PhoneVerification on success or VerificationError.

    if using_verify():
        return verify_with_twilio(phone_number, otp)

    with transaction.atomic():
        # Lock the row so two guesses sent at the same time can't both read the same attempt
        verification = (
            PhoneVerification.objects.select_for_update()
            .filter(phone_number = phone_number)
            .order_by("-created_at")
            .first()
        )

        error = usable(verification)

        if error is None and not check_password(otp, verification.code):
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