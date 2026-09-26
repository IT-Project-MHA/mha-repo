from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import generics
from rest_framework import status
from rest_framework.views import APIView
from .models import Prescription, Assessment, MyPain, MyMovement, MyPersonalCare, \
   MySocialHealth, MyManagement, GeneratedDocument, TempPatientProfile
from .serializer import *
from datetime import date

class PrescriptionListCreate(generics.ListCreateAPIView):
    def get(self, request, format=None):
        patient_profile = request.query_params.get("patient_profile","")
        if patient_profile:
            queryset = Prescription.objects.filter(patient_profile=patient_profile)
        else:
            queryset = Prescription.objects.none()
        serializer = PrescriptionSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer

class PrescriptionRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer
    lookup_field = "pk"

class ProfileListCreate(generics.ListCreateAPIView):
    queryset = TempPatientProfile.objects.all()
    serializer_class = TempPatientProfileSerializer

class ProfileRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = TempPatientProfile.objects.all()
    serializer_class = TempPatientProfileSerializer
    lookup_field = "pk"