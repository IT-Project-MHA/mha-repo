from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import generics
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, SAFE_METHODS
from django.db.models import Q
from rest_framework import serializers
from .models import Prescription, Assessment, MyPain, MyMovement, MyPersonalCare, \
   MySocialHealth, MyManagement
from accounts.models import SupportLink
from accounts.views import own_patient_profile
from .serializer import *
from datetime import date
from mpowered_api.immutable import save_without_immutable_changes

# Instructions:
# All views need the header Authorization: Token <token>, without they return 401.

# Can only see records where patient_profile is user's or who user supports if the patient
# has turned on can_view_assessments or can_view_prescriptions.

# To filter by attribute, put in the URL ?attribute_name=value. For multiple attributes:
# ?attribute_name1=value&attribute_name2=value...

# Attributes that are read only are specified in it's serializer. Sending a different value for
# them in an update request returns a 400 error.

# Records that other records depend on cannot be deleted, deleting them returns a 409 error.

# Who can insert/update/delete is specified in the comments and records the user can see but is not
# allowed to update/delete return a 404 error for those requests.

def visible_prescriptions(user):
    return Prescription.objects.filter(
            Q(patient_profile__user = user) |
            Q(patient_profile__support_links__supporter_user = user,
              patient_profile__support_links__status = SupportLink.Status.ACTIVE,
              patient_profile__support_links__can_view_prescriptions = True)
        )

# Prescription APIs: 
class PrescriptionListCreate(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PrescriptionSerializer

    def get_queryset(self):
        user = self.request.user
        query_patient_profile = self.request.query_params.get("patient_profile")
        
        query_set = visible_prescriptions(user)
        
        if query_patient_profile:
            query_set = query_set.filter(patient_profile = query_patient_profile)
        return query_set.distinct()
    
    def perform_create(self, serializer):
        user_patient_profile = own_patient_profile(self.request.user)
        serializer.save(patient_profile = user_patient_profile)

class PrescriptionRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PrescriptionSerializer

    def get_queryset(self):
        user = self.request.user
        query_patient_profile = self.request.query_params.get("patient_profile")
        
        query_set = visible_prescriptions(user)
        
        if query_patient_profile:
            query_set = query_set.filter(patient_profile = query_patient_profile)
        if self.request.method not in SAFE_METHODS:
            query_set = query_set.filter(patient_profile__user = user)
        return query_set.distinct()



# Assessment APIs: 

# helper function: returns set of assessments that user can access
def visible_assessments(user):
    return Assessment.objects.filter(
            Q(patient_profile__user = user) |
            Q(patient_profile__support_links__supporter_user = user,
              patient_profile__support_links__status = SupportLink.Status.ACTIVE,
              patient_profile__support_links__can_view_assessments = True))

# helper function: returns set of assessments that belong to the user's own patient profile
def own_assessments(user):
    return Assessment.objects.filter(patient_profile__user = user)


class AssessmentListCreate(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AssessmentSerializer

    def get_queryset(self):
        user = self.request.user
        week_starting = self.request.query_params.get("week_starting")
        query_patient_profile = self.request.query_params.get("patient_profile")
        query_set = visible_assessments(user)
        if week_starting:
            query_set = query_set.filter(week_starting = week_starting)
        if query_patient_profile:
            query_set = query_set.filter(patient_profile = query_patient_profile)
        return query_set.distinct()

    def perform_create(self, serializer):
        user_patient_profile = own_patient_profile(self.request.user)
        week_starting = serializer.validated_data["week_starting"]
        if Assessment.objects.filter(patient_profile = user_patient_profile,
                                     week_starting = week_starting).exists():
            raise serializers.ValidationError(
                {'week_starting':'An assessment already exists for this week.'})
        serializer.save(patient_profile = user_patient_profile)

class AssessmentRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AssessmentSerializer

    def get_queryset(self):
        user = self.request.user
        week_starting = self.request.query_params.get("week_starting")
        query_patient_profile = self.request.query_params.get("patient_profile")
        query_set = visible_assessments(user)
        if week_starting:
            query_set = query_set.filter(week_starting = week_starting)
        if query_patient_profile:
            query_set = query_set.filter(patient_profile = query_patient_profile)
        if self.request.method not in SAFE_METHODS:
            query_set = query_set.filter(patient_profile__user = user)
        return query_set.distinct()

    def perform_update(self, serializer):
        save_without_immutable_changes(serializer, ['week_starting'])


# Assessment task APIs (MyPain, MyMovement, MyPersonalCare, MySocialHealth, MyManagement):
# each subclass sets its model & serializer_class.

# - select: assessment filter is required for lists
# - insert: only into the user's own assessments, one record per assessment
# - update/delete: only the user's own records, assessment cannot be changed
class AssessmentTaskListCreate(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    model = None

    def get_queryset(self):
        user = self.request.user
        assessment = self.request.query_params.get("assessment")
        query_patient_profile = self.request.query_params.get("patient_profile")
        query_set = self.model.objects.filter(assessment__in = visible_assessments(user))

        if not assessment:
            raise serializers.ValidationError({'assessment':'This field is required.'})
        query_set = query_set.filter(assessment = assessment)

        if query_patient_profile:
            query_set = query_set.filter(
                assessment__patient_profile = query_patient_profile)
        return query_set.distinct()

    def perform_create(self, serializer):
        assessment = serializer.validated_data["assessment"]
        if not own_assessments(self.request.user).filter(id = assessment.id).exists():
            raise serializers.ValidationError({'assessment':'You do not have access.'})
        serializer.save()

class AssessmentTaskRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    model = None

    def get_queryset(self):
        user = self.request.user
        assessment = self.request.query_params.get("assessment")
        query_patient_profile = self.request.query_params.get("patient_profile")
        query_set = self.model.objects.filter(assessment__in = visible_assessments(user))
        if assessment:
            query_set = query_set.filter(assessment = assessment)
        if query_patient_profile:
            query_set = query_set.filter(
                assessment__patient_profile = query_patient_profile)
        if self.request.method not in SAFE_METHODS:
            query_set = query_set.filter(assessment__patient_profile__user = user)
        return query_set.distinct()

    def perform_update(self, serializer):
        save_without_immutable_changes(serializer, ['assessment'])

class MyPainListCreate(AssessmentTaskListCreate):
    model = MyPain
    serializer_class = MyPainSerializer

class MyPainRetrieveUpdateDestroy(AssessmentTaskRetrieveUpdateDestroy):
    model = MyPain
    serializer_class = MyPainSerializer

class MyMovementListCreate(AssessmentTaskListCreate):
    model = MyMovement
    serializer_class = MyMovementSerializer

class MyMovementRetrieveUpdateDestroy(AssessmentTaskRetrieveUpdateDestroy):
    model = MyMovement
    serializer_class = MyMovementSerializer

class MyPersonalCareListCreate(AssessmentTaskListCreate):
    model = MyPersonalCare
    serializer_class = MyPersonalCareSerializer

class MyPersonalCareRetrieveUpdateDestroy(AssessmentTaskRetrieveUpdateDestroy):
    model = MyPersonalCare
    serializer_class = MyPersonalCareSerializer

class MySocialHealthListCreate(AssessmentTaskListCreate):
    model = MySocialHealth
    serializer_class = MySocialHealthSerializer

class MySocialHealthRetrieveUpdateDestroy(AssessmentTaskRetrieveUpdateDestroy):
    model = MySocialHealth
    serializer_class = MySocialHealthSerializer

class MyManagementListCreate(AssessmentTaskListCreate):
    model = MyManagement
    serializer_class = MyManagementSerializer

class MyManagementRetrieveUpdateDestroy(AssessmentTaskRetrieveUpdateDestroy):
    model = MyManagement
    serializer_class = MyManagementSerializer
