from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import generics
from rest_framework import status
from rest_framework.views import APIView
from .models import Prescription, Assessment, MyPain, MyMovement, MyPersonalCare, \
   MySocialHealth, MyManagement, TempPatientProfile
from .serializer import *
from datetime import date

# "Profile..." are temporary view classes.
# They must be removed once \accounts APIs are written.

class ProfileListCreate(generics.ListCreateAPIView):
    queryset = TempPatientProfile.objects.all()
    serializer_class = TempPatientProfileSerializer

class ProfileRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = TempPatientProfile.objects.all()
    serializer_class = TempPatientProfileSerializer
    lookup_field = "pk"

# Prescription APIs:
# - can only read records filtered by patient_profile id in the URL in the form:
#   ?patient_profile=...

class PrescriptionListCreate(generics.ListCreateAPIView):
    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer

    def get_queryset(self):
        patient_profile = self.request.query_params.get("patient_profile")
        if patient_profile:
            return Prescription.objects.filter(patient_profile=patient_profile)
        else:
            return Prescription.objects.none()

class PrescriptionRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer
    lookup_field = "pk"

# Assessment APIs:
# - can only read records filtered by patient_profile id in the URL in the form:
#   ?patient_profile=...
# - can read records filtered by a week_starting date in the URL in the form:
#   ?week_starting=...

class AssessmentListCreate(generics.ListCreateAPIView):
    queryset = Assessment.objects.all()
    serializer_class = AssessmentSerializer

    def get_queryset(self):
        patient_profile = self.request.query_params.get("patient_profile")
        week_starting = self.request.query_params.get("week_starting")
        if patient_profile:
            if week_starting:
                return Assessment.objects.filter(
                    week_starting=week_starting,
                    patient_profile=patient_profile
                )
            else:
                return Assessment.objects.filter(patient_profile=patient_profile)
        else:
            return Assessment.objects.none()

class AssessmentRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Assessment.objects.all()
    serializer_class = AssessmentSerializer
    lookup_field = "pk"

# Assessment task APIs (MyPain, MyMovement, MyPersonalCare, MySocialHealth, MyManagement):
# - can only read records filtered by assessment id in the URL in the form:
#   ?assessment=...

class MyPainListCreate(generics.ListCreateAPIView):
    queryset = MyPain.objects.all()
    serializer_class = MyPainSerializer

    def get_queryset(self):
        assessment = self.request.query_params.get("assessment")
        if assessment:
            return MyPain.objects.filter(assessment=assessment)
        else:
            return MyPain.objects.none()

class MyPainRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = MyPain.objects.all()
    serializer_class = MyPainSerializer
    lookup_field = "pk"

class MyMovementListCreate(generics.ListCreateAPIView):
    queryset = MyMovement.objects.all()
    serializer_class = MyMovementSerializer

    def get_queryset(self):
        assessment = self.request.query_params.get("assessment")
        if assessment:
            return MyMovement.objects.filter(assessment=assessment)
        else:
            return MyMovement.objects.none()

class MyMovementRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = MyMovement.objects.all()
    serializer_class = MyMovementSerializer
    lookup_field = "pk"

class MyPersonalCareListCreate(generics.ListCreateAPIView):
    queryset = MyMovement.objects.all()
    serializer_class = MyMovementSerializer

    def get_queryset(self):
        assessment = self.request.query_params.get("assessment")
        if assessment:
            return MyMovement.objects.filter(assessment=assessment)
        else:
            return MyMovement.objects.none()

class MyPersonalCareRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = MyMovement.objects.all()
    serializer_class = MyMovementSerializer
    lookup_field = "pk"

class MySocialHealthListCreate(generics.ListCreateAPIView):
    queryset = MySocialHealth.objects.all()
    serializer_class = MySocialHealthSerializer

    def get_queryset(self):
        assessment = self.request.query_params.get("assessment")
        if assessment:
            return MySocialHealth.objects.filter(assessment=assessment)
        else:
            return MySocialHealth.objects.none()

class MySocialHealthRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = MySocialHealth.objects.all()
    serializer_class = MySocialHealthSerializer
    lookup_field = "pk"

class MyManagementListCreate(generics.ListCreateAPIView):
    queryset = MySocialHealth.objects.all()
    serializer_class = MySocialHealthSerializer

    def get_queryset(self):
        assessment = self.request.query_params.get("assessment")
        if assessment:
            return MySocialHealth.objects.filter(assessment=assessment)
        else:
            return MySocialHealth.objects.none()

class MyManagementRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = MySocialHealth.objects.all()
    serializer_class = MySocialHealthSerializer
    lookup_field = "pk"