from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import User, PatientProfile, UserSettings, SupportLink, TermsAndPrivacy
from .serializer import *

# instructions:
# All views are protected by authenticated user id (can only see records where patient_profile
# is user's own, or who user supports), for relevant tables.

# Attributes that can be filtered are specified in the comments. To filter by attribute, put
# in the URL ?attribute_name=value. For multiple attributes:
# ?attribute_name1=value&?attribute_name2=value...


# User APIs:
# - select: can only see own user

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


# PatientProfile APIs:
# - select: can filter by user

# helper function: returns set of patient profiles that user can access
def visible_patient_profiles(user):
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

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(user = user)

class PatientProfileRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PatientProfileSerializer

    def get_queryset(self):
        user = self.request.user
        query_user = self.request.query_params.get("user")
        query_set = visible_patient_profiles(user)
        if query_user:
            query_set = query_set.filter(user = query_user)
        return query_set.distinct()


# UserSettings APIs:
# - select: can only see own settings

class UserSettingsListCreate(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSettingsSerializer

    def get_queryset(self):
        user = self.request.user
        return UserSettings.objects.filter(user = user)

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(user = user)

class UserSettingsRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSettingsSerializer

    def get_queryset(self):
        user = self.request.user
        return UserSettings.objects.filter(user = user)


# SupportLink APIs:
# - select: can only see links where user is the patient or supporter, can filter by
#   patient_profile, status
# - insert: patient_profile & patient_user are set to the user's own

# helper function: returns set of support links that user can access
def visible_support_links(user):
    return SupportLink.objects.filter(Q(patient_user = user) | Q(supporter_user = user))

class SupportLinkListCreate(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SupportLinkSerializer

    def get_queryset(self):
        user = self.request.user
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
        serializer.save(patient_profile = user.patient_profile, patient_user = user)

class SupportLinkRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SupportLinkSerializer

    def get_queryset(self):
        user = self.request.user
        query_patient_profile = self.request.query_params.get("patient_profile")
        query_status = self.request.query_params.get("status")
        query_set = visible_support_links(user)
        if query_patient_profile:
            query_set = query_set.filter(patient_profile = query_patient_profile)
        if query_status:
            query_set = query_set.filter(status = query_status)
        return query_set.distinct()


# TermsAndPrivacy APIs:
# - select: can only see own records, can filter by document_type

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

class TermsAndPrivacyRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TermsAndPrivacySerializer

    def get_queryset(self):
        user = self.request.user
        document_type = self.request.query_params.get("document_type")
        query_set = TermsAndPrivacy.objects.filter(user = user)
        if document_type:
            query_set = query_set.filter(document_type = document_type)
        return query_set
