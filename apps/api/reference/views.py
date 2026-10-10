from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import generics
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from rest_framework import serializers
from .models import QuestionOption, QuestionOptionOrdered
from .serializer import *
from datetime import date

# Instructions:
# All views need the header Authorization: Token <token> without they return 401.

# Read only and the same for every user.

# To filter by attribute, put in the URL ?attribute_name=value. For multiple attributes:
# ?attribute_name1=value&attribute_name2=value...


# QuestionOption APIs:
class QuestionOptionList(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = QuestionOptionSerializer

    def get_queryset(self):
        app_section = self.request.query_params.get("app_section")
        question_key = self.request.query_params.get("question_key")
        if not app_section:
            raise serializers.ValidationError({'app_section':'This field is required.'})
        if not question_key:
            raise serializers.ValidationError({'question_key':'This field is required.'}) 
        return QuestionOption.objects.filter(app_section=app_section, 
                                             question_key=question_key)


class QuestionOptionRetrieve(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    queryset = QuestionOption.objects.all()
    serializer_class = QuestionOptionSerializer

# QuestionOptionOrdered APIs:
class QuestionOptionOrderedList(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = QuestionOptionOrderedSerializer

    def get_queryset(self):
        app_section = self.request.query_params.get("app_section")
        question_key = self.request.query_params.get("question_key")
        if not app_section:
            raise serializers.ValidationError({'app_section':'This field is required.'})
        if not question_key:
            raise serializers.ValidationError({'question_key':'This field is required.'}) 
        return QuestionOptionOrdered.objects.filter(app_section=app_section, 
                                             question_key=question_key)

class QuestionOptionOrderedRetrieve(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    queryset = QuestionOptionOrdered.objects.all()
    serializer_class = QuestionOptionOrderedSerializer

from django.http import Http404
from .models import AppSection
from accounts.models import PatientProfile, SupportLink, TermsAndPrivacy
from appointment.models import Appointment, AppointmentQuestion
from health.models import Prescription, Assessment
from audit.models import AuditEntry

CHOICES = {
    'assignedGender': PatientProfile.AssignedGender,
    'supportLinkStatus': SupportLink.Status,
    'documentType': TermsAndPrivacy.Document,
    'appointmentStatus': Appointment.Status,
    'healthService': Appointment.HealthService,
    'appointmentQuestionSource': AppointmentQuestion.Source,
    'strengthUnit': Prescription.StrengthUnit,
    'formUnit': Prescription.FormUnit,
    'frequencyUnit': Prescription.FrequencyUnit,
    'assessmentStatus': Assessment.Status,
    'auditAction': AuditEntry.Action,
    'auditTarget': AuditEntry.Target,
    'appSection': AppSection,
}

class ChoicesList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, name):
        choices = CHOICES.get(name)
        if choices is None:
            raise Http404(f'No choices named {name}.')
        return Response([{'value': value, 'label': label}
                         for value, label in choices.choices])
