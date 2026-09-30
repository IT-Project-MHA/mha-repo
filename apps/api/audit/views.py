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
# - update: N/A, audit entries cannot be updated
# - delete: N/A, audit entries cannot be deleted

class AuditEntryListCreate(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AuditEntrySerializer

    def get_queryset(self):
        user = self.request.user
        return AuditEntry.objects.filter(audit_user = user)

class AuditEntryRetrieve(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AuditEntrySerializer

    def get_queryset(self):
        user = self.request.user
        return AuditEntry.objects.filter(audit_user = user)