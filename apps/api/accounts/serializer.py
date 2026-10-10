from rest_framework import serializers
from .models import User, PatientProfile, UserSettings, SupportLink, TermsAndPrivacy, TrustedDevice
from mpowered_api.validators import current_date

from accounts.otp import OTP_LENGTH
from accounts.phone_normaliser import normalise_phone_number
from reference.models import QuestionOption

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'phone_number', 'display_name', 'email', 'created_at', 'updated_at', 'deleted_at']
        read_only_fields = ['phone_number', 'deleted_at']

class PatientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientProfile
        fields = '__all__'
        read_only_fields = ['user']

    def validate_birth_year(self, birth_year):
        # can't be in the future
        if birth_year is not None and birth_year > current_date().year:
            raise serializers.ValidationError('Birth year cannot be in the future.')
        return birth_year


class UserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSettings
        fields = '__all__'
        read_only_fields = ['user']

class SupportLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportLink
        fields = '__all__'
        read_only_fields = ['patient_profile', 'patient_user']



class TermsAndPrivacySerializer(serializers.ModelSerializer):
    class Meta:
        model = TermsAndPrivacy
        fields = '__all__'
        read_only_fields = ['user']

class TrustedDeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrustedDevice
        fields = '__all__'
        read_only_fields = ['user', 'last_seen_at']

PIN_LENGTH = 6

class PhoneNumberField(serializers.CharField):

    default_error_messages = {"invalid_phone": "Enter an Australian mobile number."}

    def __init__(self, **kwargs):
        kwargs.setdefault("max_length", 20)
        super().__init__(**kwargs)

    def to_internal_value(self, data):
        phone_number = normalise_phone_number(super().to_internal_value(data))

        if phone_number is None:
            self.fail("invalid_phone")

        return phone_number
    
class RequestCodeSerializer(serializers.Serializer):
    phone_number = PhoneNumberField()


class VerifyCodeSerializer(RequestCodeSerializer):
    otp = serializers.RegexField(rf"^\d{{{OTP_LENGTH}}}$")


class HealthDetailsSerializer(serializers.ModelSerializer):
    # Optional health details, only sent if track my health is ticked

    # Only allow options from the pain type question
    pain_types = serializers.PrimaryKeyRelatedField(
        many = True,
        required = False,
        queryset = QuestionOption.objects.filter(question_key = "pain_type", is_active = True),
    )

    class Meta:
        model = PatientProfile
        fields = ["has_diagnosis", "other_conditions", "assigned_gender_at_birth", "birth_year", "pain_types"]


class RegisterSerializer(serializers.Serializer):
    verification_id = serializers.UUIDField()
    phone_number = PhoneNumberField()
    display_name = serializers.CharField(max_length = 120)
    pin = serializers.RegexField(rf"^\d{{{PIN_LENGTH}}}$", write_only = True)
    accepted_terms = serializers.BooleanField()
    accepted_privacy = serializers.BooleanField()
    track_health = serializers.BooleanField(default = False)
    health = HealthDetailsSerializer(required = False)

    device_id = serializers.CharField(max_length = 128)

    def validate_accepted_terms(self, value):
        # Terms and Conditions must be accepted
        if not value:
            raise serializers.ValidationError("Terms of Service must be accepted.")

        return value

    def validate_accepted_privacy(self, value):
        # Privacy policy must be accepted
        if not value:
            raise serializers.ValidationError("Privacy Policy must be accepted.")

        return value

    def validate(self, data):
        # Health details only allowed if they're tracking their health
        if "health" in data and not data["track_health"]:
            raise serializers.ValidationError({"health": "Only send health details when track_health is true."})

        return data


class LoginSerializer(serializers.Serializer):
    phone_number = PhoneNumberField()
    pin = serializers.RegexField(rf"^\d{{{PIN_LENGTH}}}$", write_only = True)
    device_id = serializers.CharField(max_length = 128)

    # Only needed when signing in on a new device
    verification_id = serializers.UUIDField(required = False)


class DeviceListSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrustedDevice
        fields = ["id", "device_id", "label", "last_seen_at", "created_at"]


class ResetPinSerializer(serializers.Serializer):
    phone_number = PhoneNumberField()
    verification_id = serializers.UUIDField()
    pin = serializers.RegexField(rf"^\d{{{PIN_LENGTH}}}$", write_only = True)
    device_id = serializers.CharField(max_length = 128)
