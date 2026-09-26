from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import generics
from rest_framework import status
from rest_framework.views import APIView
from .models import AuditEntry
from .serializer import *
from datetime import date

# AuditEntry APIs:
# - can read records filtered by patient_profile in the URL in the form: 
#   ?patient_profile=...

class AuditEntryListCreate(generics.ListCreateAPIView):
    queryset = AuditEntry.objects.all()
    serializer_class = AuditEntrySerializer

    def get_queryset(self):
        patient_profile = self.request.query_params.get("patient_profile")
        if patient_profile:
            return AuditEntry.objects.filter(patient_profile=patient_profile)
        else:
            return AuditEntry.objects.none()

class AuditEntryRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = AuditEntry.objects.all()
    serializer_class = AuditEntrySerializer
    lookup_field = "pk"