from rest_framework import serializers
from .models import User, PatientProfile, UserSettings, SupportLink, TermsAndPrivacy

# UserSerializer excludes password (pin) & permission fields so they can't be read or written.

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'phone_number', 'display_name', 'email', 'created_at', 'updated_at',
                  'deleted_at']

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

class PatientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientProfile
        fields = '__all__'
        read_only_fields = ['user']

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
