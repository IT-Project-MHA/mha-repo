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

# instructions:
# All views are protected by authenticated user id (can only see records where patient_profile
# is user's own, or who user supports), for relevant tables.

# To filter by attribute, put in the URL ?attribute_name=value. For multiple attributes:
# ?attribute_name1=value&?attribute_name2=value...

# Attributes that are read only are specified in it's serializer. Sending a different value for
# them in an update request returns a 400 error.

# Records that other records depend on cannot be deleted; deleting them returns a 409 error.

# Who can insert/update/delete is specified in the comments. Records the user can see but is not
# allowed to update/delete return a 404 error for those requests.


# Prescription APIs: 
class PrescriptionListCreate(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PrescriptionSerializer

    def get_queryset(self):
        user = self.request.user
        query_patient_profile = self.request.query_params.get("patient_profile")
        query_set =  Prescription.objects.filter(
            Q(patient_profile__user = user) |
            Q(patient_profile__support_links__supporter_user = user,
              patient_profile__support_links__status = SupportLink.Status.ACTIVE))
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
        query_set =  Prescription.objects.filter(
            Q(patient_profile__user = user) |
            Q(patient_profile__support_links__supporter_user = user,
              patient_profile__support_links__status = SupportLink.Status.ACTIVE))
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
              patient_profile__support_links__status = SupportLink.Status.ACTIVE)
        )

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


# Assessment task APIs (MyPain, MyMovement, MyPersonalCare, MySocialHealth, MyManagement):
class MyPainListCreate(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MyPainSerializer

    def get_queryset(self):
        user = self.request.user
        assessment = self.request.query_params.get("assessment")
        query_patient_profile = self.request.query_params.get("patient_profile")
        query_set = MyPain.objects.filter(assessment__in = visible_assessments(user))

        if not assessment:
            raise serializers.ValidationError({'assessment':'This field is required.'})
        query_set = query_set.filter(assessment = assessment)

        if query_patient_profile:
            query_set = query_set.filter(
                assessment__patient_profile = query_patient_profile)
        return query_set.distinct()

    def perform_create(self, serializer):
        user = self.request.user
        assessment_id = self.request.data.get("assessment")
        if not assessment_id:
            raise serializers.ValidationError({'assessment': 'This field is required.'})
        try:
            assessment = Assessment.objects.get(id=assessment_id)
        except Assessment.DoesNotExist:
            raise serializers.ValidationError({'assessment': 'Invalid assessment.'})
        if not own_assessments(user).filter(id=assessment.id).exists():
            raise serializers.ValidationError({'assessment': 'You do not have access.'})
        serializer.save(assessment=assessment)

class MyPainRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MyPainSerializer

    def get_queryset(self):
        user = self.request.user
        assessment = self.request.query_params.get("assessment")
        query_patient_profile = self.request.query_params.get("patient_profile")
        query_set = MyPain.objects.filter(assessment__in = visible_assessments(user))
        if assessment:
            query_set = query_set.filter(assessment = assessment)
        if query_patient_profile:
            query_set = query_set.filter(
                assessment__patient_profile = query_patient_profile)
        if self.request.method not in SAFE_METHODS:
            query_set = query_set.filter(assessment__patient_profile__user = user)
        return query_set.distinct()

class MyMovementListCreate(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MyMovementSerializer

    def get_queryset(self):
        user = self.request.user
        assessment = self.request.query_params.get("assessment")
        query_patient_profile = self.request.query_params.get("patient_profile")
        query_set = MyMovement.objects.filter(assessment__in = visible_assessments(user))

        if not assessment:
            raise serializers.ValidationError({'assessment':'This field is required.'})
        query_set = query_set.filter(assessment = assessment)

        if query_patient_profile:
            query_set = query_set.filter(
                assessment__patient_profile = query_patient_profile)
        return query_set.distinct()

    def perform_create(self, serializer):
        user = self.request.user
        assessment_id = self.request.data.get("assessment")
        if not assessment_id:
            raise serializers.ValidationError({'assessment': 'This field is required.'})
        try:
            assessment = Assessment.objects.get(id=assessment_id)
        except Assessment.DoesNotExist:
            raise serializers.ValidationError({'assessment': 'Invalid assessment.'})
        if not own_assessments(user).filter(id=assessment.id).exists():
            raise serializers.ValidationError({'assessment': 'You do not have access.'})
        serializer.save(assessment=assessment)

class MyMovementRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MyMovementSerializer

    def get_queryset(self):
        user = self.request.user
        assessment = self.request.query_params.get("assessment")
        query_patient_profile = self.request.query_params.get("patient_profile")
        query_set = MyMovement.objects.filter(assessment__in = visible_assessments(user))
        if assessment:
            query_set = query_set.filter(assessment = assessment)
        if query_patient_profile:
            query_set = query_set.filter(
                assessment__patient_profile = query_patient_profile)
        if self.request.method not in SAFE_METHODS:
            query_set = query_set.filter(assessment__patient_profile__user = user)
        return query_set.distinct()

class MyPersonalCareListCreate(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MyPersonalCareSerializer

    def get_queryset(self):
        user = self.request.user
        assessment = self.request.query_params.get("assessment")
        query_patient_profile = self.request.query_params.get("patient_profile")
        query_set = MyPersonalCare.objects.filter(assessment__in = visible_assessments(user))

        if not assessment:
            raise serializers.ValidationError({'assessment':'This field is required.'})
        query_set = query_set.filter(assessment = assessment)

        if query_patient_profile:
            query_set = query_set.filter(
                assessment__patient_profile = query_patient_profile)
        return query_set.distinct()

    def perform_create(self, serializer):
        user = self.request.user
        assessment_id = self.request.data.get("assessment")
        if not assessment_id:
            raise serializers.ValidationError({'assessment': 'This field is required.'})
        try:
            assessment = Assessment.objects.get(id=assessment_id)
        except Assessment.DoesNotExist:
            raise serializers.ValidationError({'assessment': 'Invalid assessment.'})
        if not own_assessments(user).filter(id=assessment.id).exists():
            raise serializers.ValidationError({'assessment': 'You do not have access.'})
        serializer.save(assessment=assessment)

class MyPersonalCareRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MyPersonalCareSerializer

    def get_queryset(self):
        user = self.request.user
        assessment = self.request.query_params.get("assessment")
        query_patient_profile = self.request.query_params.get("patient_profile")
        query_set = MyPersonalCare.objects.filter(assessment__in = visible_assessments(user))
        if assessment:
            query_set = query_set.filter(assessment = assessment)
        if query_patient_profile:
            query_set = query_set.filter(
                assessment__patient_profile = query_patient_profile)
        if self.request.method not in SAFE_METHODS:
            query_set = query_set.filter(assessment__patient_profile__user = user)
        return query_set.distinct()

class MySocialHealthListCreate(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MySocialHealthSerializer

    def get_queryset(self):
        user = self.request.user
        assessment = self.request.query_params.get("assessment")
        query_patient_profile = self.request.query_params.get("patient_profile")
        query_set = MySocialHealth.objects.filter(assessment__in = visible_assessments(user))

        if not assessment:
            raise serializers.ValidationError({'assessment':'This field is required.'})
        query_set = query_set.filter(assessment = assessment)

        if query_patient_profile:
            query_set = query_set.filter(
                assessment__patient_profile = query_patient_profile)
        return query_set.distinct()

    def perform_create(self, serializer):
        user = self.request.user
        assessment_id = self.request.data.get("assessment")
        if not assessment_id:
            raise serializers.ValidationError({'assessment': 'This field is required.'})
        try:
            assessment = Assessment.objects.get(id=assessment_id)
        except Assessment.DoesNotExist:
            raise serializers.ValidationError({'assessment': 'Invalid assessment.'})
        if not own_assessments(user).filter(id=assessment.id).exists():
            raise serializers.ValidationError({'assessment': 'You do not have access.'})
        serializer.save(assessment=assessment)

class MySocialHealthRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MySocialHealthSerializer

    def get_queryset(self):
        user = self.request.user
        assessment = self.request.query_params.get("assessment")
        query_patient_profile = self.request.query_params.get("patient_profile")
        query_set = MySocialHealth.objects.filter(assessment__in = visible_assessments(user))
        if assessment:
            query_set = query_set.filter(assessment = assessment)
        if query_patient_profile:
            query_set = query_set.filter(
                assessment__patient_profile = query_patient_profile)
        if self.request.method not in SAFE_METHODS:
            query_set = query_set.filter(assessment__patient_profile__user = user)
        return query_set.distinct()

class MyManagementListCreate(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MyManagementSerializer

    def get_queryset(self):
        user = self.request.user
        assessment = self.request.query_params.get("assessment")
        query_patient_profile = self.request.query_params.get("patient_profile")
        query_set = MyManagement.objects.filter(assessment__in = visible_assessments(user))

        if not assessment:
            raise serializers.ValidationError({'assessment':'This field is required.'})
        query_set = query_set.filter(assessment = assessment)

        if query_patient_profile:
            query_set = query_set.filter(
                assessment__patient_profile = query_patient_profile)
        return query_set.distinct()

    def perform_create(self, serializer):
        user = self.request.user
        assessment_id = self.request.data.get("assessment")
        if not assessment_id:
            raise serializers.ValidationError({'assessment': 'This field is required.'})
        try:
            assessment = Assessment.objects.get(id=assessment_id)
        except Assessment.DoesNotExist:
            raise serializers.ValidationError({'assessment': 'Invalid assessment.'})
        if not own_assessments(user).filter(id=assessment.id).exists():
            raise serializers.ValidationError({'assessment': 'You do not have access.'})
        if MyManagement.objects.filter(assessment=assessment).exists():
            raise serializers.ValidationError({'assessment': 'A MyManagement record already exists for this assessment.'})
        medication = serializer.validated_data.get('medication', [])
        if any(p.patient_profile_id != assessment.patient_profile_id for p in medication):
            raise serializers.ValidationError(
                {'medication': 'Prescriptions must belong to the assessment\'s patient.'})
        serializer.save(assessment=assessment)

class MyManagementRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MyManagementSerializer

    def get_queryset(self):
        user = self.request.user
        assessment = self.request.query_params.get("assessment")
        query_patient_profile = self.request.query_params.get("patient_profile")
        query_set = MyManagement.objects.filter(assessment__in = visible_assessments(user))
        if assessment:
            query_set = query_set.filter(assessment = assessment)
        if query_patient_profile:
            query_set = query_set.filter(
                assessment__patient_profile = query_patient_profile)
        if self.request.method not in SAFE_METHODS:
            query_set = query_set.filter(assessment__patient_profile__user = user)
        return query_set.distinct()