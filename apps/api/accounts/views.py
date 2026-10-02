from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, SAFE_METHODS
from django.db.models import Q
from rest_framework import serializers
from .models import User, PatientProfile, UserSettings, SupportLink, TermsAndPrivacy
from .serializer import *
from mpowered_api.immutable import save_without_immutable_changes
from mpowered_api.protected import destroy_or_reject_protected

# instructions:
# All views are protected by authenticated user id (can only see records where patient_profile
# is user's own, or who user supports), for relevant tables.

# To filter by attribute, put
# in the URL ?attribute_name=value. For multiple attributes:
# ?attribute_name1=value&?attribute_name2=value...

# Attributes that are read only are specified in it's serializer. Sending a different value for
# them in an update request returns a 400 error.

# Records that other records depend on cannot be deleted; deleting them returns a 409 error.

# Who can insert/update/delete is specified in the comments. Records the user can see but is not
# allowed to update/delete return a 404 error for those requests.



# User APIs:
class UserListCreate(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_queryset(self):
        user = self.request.user
        return User.objects.filter(id = user.id)

class UserRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_queryset(self):
        user = self.request.user
        return User.objects.filter(id = user.id)

    def perform_destroy(self, instance):
        destroy_or_reject_protected(instance)



# PatientProfile APIs:

# helper function: returns set of patient profiles that user can access
def visible_patient_profiles(user):
    # filter own profile or profiles of patients that user supports
    return PatientProfile.objects.filter(
            Q(user = user) |
            Q(support_links__supporter_user = user,
              support_links__status = SupportLink.Status.ACTIVE)
        )

class PatientProfileListCreate(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PatientProfileSerializer

    def get_queryset(self):
        user = self.request.user
        query_user = self.request.query_params.get("user")
        query_set = visible_patient_profiles(user)
        if query_user:
            query_set = query_set.filter(user = query_user)
        return query_set.distinct()

    # can only create one's own patient profile, and only 1 PatientProfile
    def perform_create(self, serializer):
        user = self.request.user
        if PatientProfile.objects.filter(user = user).exists():
            raise serializers.ValidationError(
                {'user':'A patient profile already exists for this user.'})
        serializer.save(user = user)

class PatientProfileRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PatientProfileSerializer

    def get_queryset(self):
        user = self.request.user
        query_set = visible_patient_profiles(user)

        # user can only edit their own patient_profile
        if self.request.method not in SAFE_METHODS:
            query_set = query_set.filter(user = user)
        return query_set.distinct()

    def perform_destroy(self, instance):
        destroy_or_reject_protected(instance)



# UserSettings APIs:
class UserSettingsListCreate(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSettingsSerializer

    def get_queryset(self):
        user = self.request.user
        return UserSettings.objects.filter(user = user)

    def perform_create(self, serializer):
        user = self.request.user
        # user can only have 1 UserSettings
        if UserSettings.objects.filter(user = user).exists():
            raise serializers.ValidationError(
                {'user':'User settings already exist for this user.'})
        serializer.save(user = user)

class UserSettingsRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSettingsSerializer

    def get_queryset(self):
        user = self.request.user
        return UserSettings.objects.filter(user = user)



# SupportLink APIs:

# helper function: returns set of support links that user can access
def visible_support_links(user):
    return SupportLink.objects.filter(Q(patient_user = user) | Q(supporter_user = user))

# helper function: returns user's own patient profile, or raises 400 error if user doesn't have one
def own_patient_profile(user):
    patient_profile = PatientProfile.objects.filter(user = user).first()
    if not patient_profile:
        raise serializers.ValidationError(
            {'patient_profile':'User does not have a patient profile.'})
    return patient_profile

class SupportLinkListCreate(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SupportLinkSerializer

    def get_queryset(self):
        user = self.request.user
        # can filter by patient_profile and status
        query_patient_profile = self.request.query_params.get("patient_profile")
        query_status = self.request.query_params.get("status")
        query_set = visible_support_links(user)
        if query_patient_profile:
            query_set = query_set.filter(patient_profile = query_patient_profile)
        if query_status:
            query_set = query_set.filter(status = query_status)
        return query_set.distinct()

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(patient_profile = own_patient_profile(user), patient_user = user,
                        status = SupportLink.Status.INVITED)

class SupportLinkRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SupportLinkSerializer

    def get_queryset(self):
        user = self.request.user
        query_patient_profile = self.request.query_params.get("patient_profile")
        query_status = self.request.query_params.get("status")
        query_set = visible_support_links(user)

        # user can only delete support link where they are the patient
        if self.request.method == 'DELETE':
            query_set = query_set.filter(patient_user = user)
        if query_patient_profile:
            query_set = query_set.filter(patient_profile = query_patient_profile)
        if query_status:
            query_set = query_set.filter(status = query_status)
        return query_set.distinct()

    def perform_update(self, serializer):
        user = self.request.user
        instance = serializer.instance
        errors = {}
        if instance.patient_user_id == user.id:
            raise serializers.ValidationError('Patients cannot update a support link.')
        else:
            # supporter can only change status, to active (accept) or revoked
            for field, value in serializer.validated_data.items():
                if field != 'status' and value != getattr(instance, field):
                    errors[field] = 'Supporters can only change status.'
            new_status = serializer.validated_data.get('status', instance.status)
            if new_status != instance.status and new_status not in [SupportLink.Status.ACTIVE,
                                                                     SupportLink.Status.REVOKED]:
                errors['status'] = 'Supporters can only change status to active or revoked.'
        if errors:
            raise serializers.ValidationError(errors)
        save_without_immutable_changes(serializer, ['patient_profile', 'patient_user',
            'supporter_user', 'invited_phone_number', 'invited_at'])

    def perform_destroy(self, instance):
        destroy_or_reject_protected(instance)



# TermsAndPrivacy APIs:
class TermsAndPrivacyListCreate(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TermsAndPrivacySerializer

    def get_queryset(self):
        user = self.request.user
        document_type = self.request.query_params.get("document_type")
        query_set = TermsAndPrivacy.objects.filter(user = user)
        if document_type:
            query_set = query_set.filter(document_type = document_type)
        return query_set

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(user = user)

class TermsAndPrivacyRetrieve(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TermsAndPrivacySerializer

    def get_queryset(self):
        user = self.request.user
        document_type = self.request.query_params.get("document_type")
        query_set = TermsAndPrivacy.objects.filter(user = user)
        if document_type:
            query_set = query_set.filter(document_type = document_type)
        return query_set
