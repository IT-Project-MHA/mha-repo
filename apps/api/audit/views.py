from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import generics
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from rest_framework import serializers
from .models import AuditEntry
from accounts.models import PatientProfile, SupportLink
from .serializer import *
from datetime import date

# instructions:
# All views are protected by authenticated user id (can only see records where patient_profile
# is user's own, or who user supports), for relevant tables.

# Attributes that can be filtered are specified in the comments. To filter by attribute, put 
# in the URL ?attribute_name=value. For multiple attributes: 
# ?attribute_name1=value&?attribute_name2=value...


# AuditEntry APIs:
# - select: can only see own audit entries
# - insert: audit_user is set to the user, patient_profile (if given) must be the user's own or
#   one the user actively supports
# - update: N/A, audit entries cannot be updated
# - delete: N/A, audit entries cannot be deleted

class AuditEntryListCreate(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AuditEntrySerializer

    def get_queryset(self):
        user = self.request.user
        return AuditEntry.objects.filter(audit_user = user)

    def perform_create(self, serializer):
        user = self.request.user
        patient_profile = serializer.validated_data.get("patient_profile")
        if patient_profile:
            visible_patient_profiles = PatientProfile.objects.filter(
                Q(user = user) |
                Q(support_links__supporter_user = user,
                  support_links__status = SupportLink.Status.ACTIVE))
            if not visible_patient_profiles.filter(id = patient_profile.id).exists():
                raise serializers.ValidationError({'patient_profile':'You do not have access.'})

        serializer.save(audit_user = user)

class AuditEntryRetrieve(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AuditEntrySerializer

    def get_queryset(self):
        user = self.request.user
        return AuditEntry.objects.filter(audit_user = user)