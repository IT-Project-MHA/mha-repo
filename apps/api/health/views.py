from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import generics
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from rest_framework import serializers
from .models import Prescription, Assessment, MyPain, MyMovement, MyPersonalCare, \
   MySocialHealth, MyManagement
from accounts.models import SupportLink
from .serializer import *
from mpowered_api.immutable import save_without_immutable_changes
from datetime import date

# instructions:
# All views are protected by authenticated user id (can only see records where patient_profile
# is user's own, or who user supports), for relevant tables.

# Attributes that can be filtered are specified in the comments. To filter by attribute, put 
# in the URL ?attribute_name=value. For multiple attributes: 
# ?attribute_name1=value&?attribute_name2=value...

# Attributes that cannot be updated are specified in the comments. Sending a different value for
# them in an update request returns a 400 error.


# Prescription APIs: 
# - select: can filter by patient_profile
# - update: patient_profile cannot be changed

class PrescriptionListCreate(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PrescriptionSerializer

    def get_queryset(self):
        user = self.request.user
        user_patient_profile = self.request.user.patient_profile
        query_patient_profile = self.request.query_params.get("patient_profile")
        query_set =  Prescription.objects.filter(
            Q(patient_profile = user_patient_profile) | 
            Q(patient_profile__support_links__supporter_user = user,
              patient_profile__support_links__status = SupportLink.Status.ACTIVE))
        if query_patient_profile:
            query_set = query_set.filter(patient_profile = query_patient_profile)
        return query_set.distinct()
    
    def perform_create(self, serializer):
        user_patient_profile = self.request.user.patient_profile
        serializer.save(patient_profile = user_patient_profile)

class PrescriptionRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PrescriptionSerializer

    def get_queryset(self):
        user = self.request.user
        user_patient_profile = self.request.user.patient_profile
        query_patient_profile = self.request.query_params.get("patient_profile")
        query_set =  Prescription.objects.filter(
            Q(patient_profile = user_patient_profile) | 
            Q(patient_profile__support_links__supporter_user = user,
              patient_profile__support_links__status = SupportLink.Status.ACTIVE))
        if query_patient_profile:
            query_set = query_set.filter(patient_profile = query_patient_profile)
        return query_set.distinct()

    def perform_update(self, serializer):
        save_without_immutable_changes(serializer, ['patient_profile'])


# Assessment APIs: 
# - select: can filter by patient_profile, week_starting
# - update: patient_profile, week_starting cannot be changed

# helper function: returns set of assessments that user can access
def visible_assessments(user):
    user_patient_profile = user.patient_profile
    return Assessment.objects.filter(
            Q(patient_profile=user_patient_profile) | 
            Q(patient_profile__support_links__supporter_user = user,
              patient_profile__support_links__status = SupportLink.Status.ACTIVE)
        )


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
        user_patient_profile = self.request.user.patient_profile
        serializer.save(patient_profile=user_patient_profile)

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
        return query_set.distinct()

    def perform_update(self, serializer):
        save_without_immutable_changes(serializer, ['patient_profile', 'week_starting'])
    

# Assessment task APIs (MyPain, MyMovement, MyPersonalCare, MySocialHealth, MyManagement):
# - select: must filter by assessment
# - insert: must specify assessment id that the user has permission to access
# - update: assessment cannot be changed

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
        assessment = self.request.data.get("assessment")
        if not assessment:
            raise serializers.ValidationError({'assessment':'This field is required.'})
        
        query_set = visible_assessments(self.request.user)
        query_set = query_set.filter(assessment = assessment)
        if not query_set.exists():
            raise serializers.ValidationError({'assessment':'You do not have access.'})
        
        serializer.save(assessment = assessment)

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
        return query_set.distinct()

    def perform_update(self, serializer):
        save_without_immutable_changes(serializer, ['assessment'])

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
        assessment = self.request.data.get("assessment")
        if not assessment:
            raise serializers.ValidationError({'assessment':'This field is required.'})
        
        query_set = visible_assessments(self.request.user)
        query_set = query_set.filter(assessment = assessment)
        if not query_set.exists():
            raise serializers.ValidationError({'assessment':'You do not have access.'})
        
        serializer.save(assessment = assessment)

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
        return query_set.distinct()

    def perform_update(self, serializer):
        save_without_immutable_changes(serializer, ['assessment'])

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
        assessment = self.request.data.get("assessment")
        if not assessment:
            raise serializers.ValidationError({'assessment':'This field is required.'})
        
        query_set = visible_assessments(self.request.user)
        query_set = query_set.filter(assessment = assessment)
        if not query_set.exists():
            raise serializers.ValidationError({'assessment':'You do not have access.'})
        
        serializer.save(assessment = assessment)

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
        return query_set.distinct()

    def perform_update(self, serializer):
        save_without_immutable_changes(serializer, ['assessment'])

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
        assessment = self.request.data.get("assessment")
        if not assessment:
            raise serializers.ValidationError({'assessment':'This field is required.'})
        
        query_set = visible_assessments(self.request.user)
        query_set = query_set.filter(assessment = assessment)
        if not query_set.exists():
            raise serializers.ValidationError({'assessment':'You do not have access.'})
        
        serializer.save(assessment = assessment)

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
        return query_set.distinct()

    def perform_update(self, serializer):
        save_without_immutable_changes(serializer, ['assessment'])

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
        assessment = self.request.data.get("assessment")
        if not assessment:
            raise serializers.ValidationError({'assessment':'This field is required.'})
        
        query_set = visible_assessments(self.request.user)
        query_set = query_set.filter(assessment = assessment)
        if not query_set.exists():
            raise serializers.ValidationError({'assessment':'You do not have access.'})
        
        serializer.save(assessment = assessment)

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
        return query_set.distinct()

    def perform_update(self, serializer):
        save_without_immutable_changes(serializer, ['assessment'])