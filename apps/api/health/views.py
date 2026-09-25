from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Prescription, Assessment, MyPain, MyMovement, MyPersonalCare, \
   MySocialHealth, MyManagement, GeneratedDocument
from .serializer import *
from datetime import date

@api_view(['GET'])
def get_prescriptions(request):
    prescriptions = Prescription.objects.all()
    serializer = PrescriptionSerializer(prescriptions, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def create_prescription(request):
    serializer = PrescriptionSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)