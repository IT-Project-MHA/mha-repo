from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import generics
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, SAFE_METHODS
from django.db.models import Q
from rest_framework import serializers

from datetime import timedelta, date

from .models import Prescription, Assessment, MyPain, MyMovement, MyPersonalCare, MySocialHealth, MyManagement
from accounts.views import own_patient_profile
from .serializer import *
from mpowered_api.immutable import save_without_immutable_changes
from accounts.permissions import visible_assessments, visible_prescriptions
from mpowered_api.soft_delete import soft_delete
from audit.record_view import RecordView
from audit.models import AuditEntry
from audit.services import record


# Instructions:
# All views need the header Authorization: Token <token>, without they return 401.

# Can only see records where patient_profile is user's or who user supports if the patient
# has turned on can_view_assessments or can_view_prescriptions.

# To filter by attribute, put in the URL ?attribute_name=value. For multiple attributes:
# ?attribute_name1=value&attribute_name2=value...

# Attributes that are read only are specified in it's serializer.
# If sent in update request they are ignored.

# Records that other records depend on cannot be deleted, deleting them returns a 409 error.

# Who can insert/update/delete is specified in the comments and records the user can see but is not
# allowed to update/delete return a 404 error for those requests.

# Prescription APIs: 
class PrescriptionListCreate(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PrescriptionSerializer

    def get_queryset(self):
        user = self.request.user
        query_patient_profile = self.request.query_params.get("patient_profile")
        
        query_set = visible_prescriptions(user).filter(deleted_at__isnull = True)
        
        if query_patient_profile:
            query_set = query_set.filter(patient_profile = query_patient_profile)
        return query_set.distinct()
    
    def perform_create(self, serializer):
        user_patient_profile = own_patient_profile(self.request.user)
        serializer.save(patient_profile = user_patient_profile)
        record(self.request.user, AuditEntry.Action.CREATE, serializer.instance)


class PrescriptionRetrieveUpdateDestroy(RecordView, generics.RetrieveUpdateDestroyAPIView):
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

    def perform_update(self, serializer):
        serializer.save()
        record(self.request.user, AuditEntry.Action.UPDATE, serializer.instance)

    # soft delete so past assessments with this medication still show it
    def perform_destroy(self, instance):
        soft_delete(instance)
        record(self.request.user, AuditEntry.Action.DELETE, instance)




# Assessment APIs: 

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
        record(self.request.user, AuditEntry.Action.CREATE, serializer.instance)


class AssessmentRetrieveUpdateDestroy(RecordView, generics.RetrieveUpdateDestroyAPIView):
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
        record(self.request.user, AuditEntry.Action.UPDATE, serializer.instance)

    # Only unsubmitted drafts can be deleeted a submitted week is part of the patient's history
    def perform_destroy(self, instance):
        if instance.status != Assessment.Status.DRAFT:
            raise serializers.ValidationError({'status':'Only a draft assessment can be deleted'})
        record(self.request.user, AuditEntry.Action.DELETE, instance)
        instance.delete()

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
        record(self.request.user, AuditEntry.Action.UPDATE, assessment)

class AssessmentTaskRetrieveUpdateDestroy(RecordView, generics.RetrieveUpdateDestroyAPIView):
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
        record(self.request.user, AuditEntry.Action.UPDATE, serializer.instance.assessment)

    # Sections of a submitted assessment can't be deleted either
    def perform_destroy(self, instance):
        if instance.assessment.status != Assessment.Status.DRAFT:
            raise serializers.ValidationError({'assessment':'Only sections of a draft assessment can be deleted'})

        record(self.request.user, AuditEntry.Action.UPDATE, instance.assessment)
        instance.delete()

    # Logged against their assessment
    def audit_target(self, instance):
        return instance.assessment

    
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


# Pain Insights APIs

# helper function: returns the patient profile
# user's own
def get_patient_profile(request):
    query_patient_profile = request.query_params.get("patient_profile")

    if query_patient_profile:
        return query_patient_profile
    
    return own_patient_profile(request.user).pk

# helper function: one week's pain scores
def pain_scores(pain):
    return {"week_starting": pain.assessment.week_starting, "current": pain.current, "worst": pain.worst, "average": pain.average, "mildest": pain.mildest}


# GET /api/painTrend/?patient_profile=<id>&days=30
# - weekly pain scores oldest first
# - supporters only get scores if the patient has can_view_assessments on
class PainTrend(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        patient_profile = get_patient_profile(request)
        try:
            days = int(request.query_params.get("days", 30))
        except ValueError:
            raise serializers.ValidationError({'days':'Must be a whole number.'})

        if days < 1:
            raise serializers.ValidationError({'days':'Must be at least 1.'})

        start_date = date.today() - timedelta(days= days)

        query_set = MyPain.objects.filter(
            assessment__in = visible_assessments(request.user),
            assessment__patient_profile = patient_profile,
            assessment__week_starting__gte = start_date
        )

        query_set = query_set.select_related("assessment")
        query_set = query_set.order_by("assessment__week_starting")

        pain_data = []

        for pain in query_set:
            pain_data.append(pain_scores(pain))

        return Response(pain_data)


# GET /api/painProfile/?patient_profile=<id>
# - Pain profile summary: latest scores, areas ticked in the last 30 days and current medication
class PainProfile(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        patient_profile = get_patient_profile(request)
        today = date.today()
        thirty_days_ago = today - timedelta(days=30)

        # All pain records the user is allowed to see
        pains = MyPain.objects.filter(
            assessment__in = visible_assessments(request.user),
            assessment__patient_profile = patient_profile
        )

        pains = pains.select_related("assessment")

        # Latest pain record
        latest = pains.order_by("-assessment__week_starting").first()

        # Recent pain and locations
        recent_pains = pains.filter(assessment__week_starting__gte = thirty_days_ago)
        recent_pains = recent_pains.prefetch_related("locations")
        
        locations = set()
        for pain in recent_pains:
            for location in pain.locations.all():
                locations.add(location.text)
        locations = sorted(locations)

        # Current prescriptions
        prescriptions = visible_prescriptions(request.user).filter(deleted_at__isnull = True)
        prescriptions = prescriptions.filter(
            patient_profile=patient_profile
        )

        prescriptions = prescriptions.filter(Q(stopped_on__isnull = True) | Q(stopped_on__gte = today))
        prescriptions = prescriptions.distinct()

        response_data = {"latest_pain": None, "recent_locations": locations, 
                         "current_prescriptions": PrescriptionSerializer(prescriptions, many = True,).data, "last_updated": None,}

        if latest:
            response_data["latest_pain"] = pain_scores(latest)
            response_data["last_updated"] = latest.updated_at

        return Response(response_data)
