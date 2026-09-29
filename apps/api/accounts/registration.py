from datetime import timedelta

from django.conf import settings
from django.db import IntegrityError, transaction
from django.utils import timezone
from rest_framework.authtoken.models import Token

from accounts.models import PatientProfile, PhoneVerification, TermsAndPrivacy, User, UserSettings

VERIFICATION_WINDOW = timedelta(minutes = 10)

class RegistrationError(Exception):
    # Registration refused
    def __init__(self, reason):
        super().__init__(reason)
        self.reason = reason


def check_verification(verification_id, phone_number):
    # True if this phone passed verify code in the last 10 minutes
    return PhoneVerification.objects.filter(
        id = verification_id,
        phone_number = phone_number,
        used_at__gte = timezone.now() - VERIFICATION_WINDOW
        ).exists()


def create_patient_profile(user, health):
    # Make the patient profile from the optional health details
    health = dict(health)

    # Pain types are many to many so added after the row exists
    pain_types = health.pop("pain_types", [])

    profile = PatientProfile.objects.create(user = user, **health)
    profile.pain_types.set(pain_types)

    return profile


def register_user(verification_id, phone_number, display_name, pin, track_health, health = None):

    # Create the account and return user and token
    # All saved in one transaction so nothing is left half made if a step fails
    # Raises RegistrationError if the phone number isn't verified or is already taken

    if not check_verification(verification_id, phone_number):
        raise RegistrationError("verification_invalid")

    if User.objects.filter(phone_number = phone_number, deleted_at__isnull = True).exists():
        raise RegistrationError("phone_taken")

    try:
        with transaction.atomic():
            # create_user hashes the PIN for us
            user = User.objects.create_user(phone_number, display_name, pin)
            UserSettings.objects.create(user = user)

            TermsAndPrivacy.objects.create(
                user = user,
                document_type = TermsAndPrivacy.Document.TERMS,
                document_version = settings.TERMS_VERSION
            )
            TermsAndPrivacy.objects.create(
                user = user,
                document_type = TermsAndPrivacy.Document.PRIVACY,
                document_version = settings.PRIVACY_VERSION
            )

            if track_health:
                create_patient_profile(user, health or {})

            token = Token.objects.create(user = user)

    except IntegrityError:
        # If multiple registrations for the same number the database stops the second
        raise RegistrationError("phone_taken")

    return user, token