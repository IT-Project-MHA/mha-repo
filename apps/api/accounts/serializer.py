from rest_framework import serializers
from .models import User, PatientProfile, UserSettings, SupportLink, TermsAndPrivacy, \
    PhoneVerification, TrustedDevice
from mpowered_api.validators import validate_phone_number, current_date

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # excludes password (pin) & permission fields
        fields = ['id', 'phone_number', 'display_name', 'email', 'created_at', 'updated_at',
                  'deleted_at']

    def create(self, validated_data):
        # use the create_user function in UserManager in accounts\models.py
        return User.objects.create_user(**validated_data)

    def validate_phone_number(self, phone_number):
        return validate_phone_number(phone_number)

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

class PhoneVerificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhoneVerification
        fields = '__all__'
        read_only_fields = ['code', 'attempts', 'used_at', 'expires_at']

    def validate_phone_number(self, phone_number):
        return validate_phone_number(phone_number)

class TrustedDeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrustedDevice
        fields = '__all__'
        read_only_fields = ['user', 'last_seen_at']
