from rest_framework import serializers

from accounts.otp import OTP_LENGTH
from accounts.models import PatientProfile
from reference.models import QuestionOption

PIN_LENGTH = 6

class RequestCodeSchema(serializers.Serializer):
    phone_number = serializers.CharField(max_length = 20)


class VerifyCodeSchema(RequestCodeSchema):
    otp = serializers.RegexField(rf"^\d{{{OTP_LENGTH}}}$")

PIN_LENGTH = 6

class HealthDetailsSchema(serializers.ModelSerializer):
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


class RegisterSchema(serializers.Serializer):
    verification_id = serializers.UUIDField()
    phone_number = serializers.CharField(max_length = 20)
    display_name = serializers.CharField(max_length = 120)
    pin = serializers.RegexField(rf"^\d{{{PIN_LENGTH}}}$", write_only = True)
    accepted_terms = serializers.BooleanField()
    accepted_privacy = serializers.BooleanField()
    track_health = serializers.BooleanField(default = False)
    health = HealthDetailsSchema(required = False)

    def validate_terms_and_conditions(self, value):
        # Terms and Conditions must be accepted
        if not value:
            raise serializers.ValidationError("The Terms of Service must be accepted.")

        return value

    def validate_privacy_policy(self, value):
        # Privacy policy must be accepted
        if not value:
            raise serializers.ValidationError("The Privacy Policy must be accepted.")

        return value

    def validate(self, data):
        # Health details only allowed if they're tracking their health
        
        if "health" in data and not data["track_health"]:
            raise serializers.ValidationError({"health": "Only send end health details when track_health is true."})

        return data