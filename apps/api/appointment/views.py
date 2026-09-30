from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from rest_framework import serializers
from .models import Appointment, CarePerson, AppointmentQuestion, AppointmentAnswer, \
   AppointmentAccess
from accounts.models import SupportLink
from .serializer import *
from mpowered_api.immutable import save_without_immutable_changes

# instructions:
# All views are protected by authenticated user id (can only see records where patient_profile
# is user's own, or who user supports), for relevant tables.

# Attributes that can be filtered are specified in the comments. To filter by attribute, put
# in the URL ?attribute_name=value. For multiple attributes:
# ?attribute_name1=value&?attribute_name2=value...

# Attributes that cannot be updated are specified in the comments. Sending a different value for
# them in an update request returns a 400 error.


# Appointment APIs:
# - select: can filter by patient_profile, status, scheduled_date
# - insert: patient_profile & created_by are set to the user's own
# - update: patient_profile, created_by cannot be changed

# helper function: returns set of appointments that user can access (own, or granted access
# through an active support link that hasn't been revoked)
def visible_appointments(user):
    return Appointment.objects.filter(
            Q(patient_profile__user = user) |
            Q(access_grants__support_link__supporter_user = user,
              access_grants__support_link__status = SupportLink.Status.ACTIVE,
              access_grants__revoked_at__isnull = True)
        )

class AppointmentListCreate(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AppointmentSerializer

    def get_queryset(self):
        user = self.request.user
        query_patient_profile = self.request.query_params.get("patient_profile")
        query_status = self.request.query_params.get("status")
        scheduled_date = self.request.query_params.get("scheduled_date")
        query_set = visible_appointments(user)
        if query_patient_profile:
            query_set = query_set.filter(patient_profile = query_patient_profile)
        if query_status:
            query_set = query_set.filter(status = query_status)
        if scheduled_date:
            query_set = query_set.filter(scheduled_date = scheduled_date)
        return query_set.distinct()

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(patient_profile = user.patient_profile, created_by = user)

class AppointmentRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AppointmentSerializer

    def get_queryset(self):
        user = self.request.user
        query_patient_profile = self.request.query_params.get("patient_profile")
        query_status = self.request.query_params.get("status")
        scheduled_date = self.request.query_params.get("scheduled_date")
        query_set = visible_appointments(user)
        if query_patient_profile:
            query_set = query_set.filter(patient_profile = query_patient_profile)
        if query_status:
            query_set = query_set.filter(status = query_status)
        if scheduled_date:
            query_set = query_set.filter(scheduled_date = scheduled_date)
        return query_set.distinct()

    def perform_update(self, serializer):
        save_without_immutable_changes(serializer, ['patient_profile', 'created_by'])


# CarePerson APIs:
# - select: can filter by patient_profile
# - insert: patient_profile is set to the user's own

class CarePersonListCreate(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CarePersonSerializer

    def get_queryset(self):
        user = self.request.user
        query_patient_profile = self.request.query_params.get("patient_profile")
        query_set = CarePerson.objects.filter(
            Q(patient_profile__user = user) |
            Q(patient_profile__support_links__supporter_user = user,
              patient_profile__support_links__status = SupportLink.Status.ACTIVE))
        if query_patient_profile:
            query_set = query_set.filter(patient_profile = query_patient_profile)
        return query_set.distinct()

    def perform_create(self, serializer):
        user_patient_profile = self.request.user.patient_profile
        serializer.save(patient_profile = user_patient_profile)

class CarePersonRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CarePersonSerializer

    def get_queryset(self):
        user = self.request.user
        query_patient_profile = self.request.query_params.get("patient_profile")
        query_set = CarePerson.objects.filter(
            Q(patient_profile__user = user) |
            Q(patient_profile__support_links__supporter_user = user,
              patient_profile__support_links__status = SupportLink.Status.ACTIVE))
        if query_patient_profile:
            query_set = query_set.filter(patient_profile = query_patient_profile)
        return query_set.distinct()


# AppointmentQuestion APIs:
# - select: must filter by appointment
# - insert: must specify appointment id that the user has permission to access, created_by is
#   set to the user
# - update: appointment, source, created_by cannot be changed

class AppointmentQuestionListCreate(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AppointmentQuestionSerializer

    def get_queryset(self):
        user = self.request.user
        appointment = self.request.query_params.get("appointment")
        query_set = AppointmentQuestion.objects.filter(
            appointment__in = visible_appointments(user))

        if not appointment:
            raise serializers.ValidationError({'appointment':'This field is required.'})
        query_set = query_set.filter(appointment = appointment)
        return query_set.distinct()

    def perform_create(self, serializer):
        user = self.request.user
        appointment = serializer.validated_data["appointment"]
        if not visible_appointments(user).filter(id = appointment.id).exists():
            raise serializers.ValidationError({'appointment':'You do not have access.'})

        serializer.save(created_by = user)

class AppointmentQuestionRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AppointmentQuestionSerializer

    def get_queryset(self):
        user = self.request.user
        appointment = self.request.query_params.get("appointment")
        query_set = AppointmentQuestion.objects.filter(
            appointment__in = visible_appointments(user))
        if appointment:
            query_set = query_set.filter(appointment = appointment)
        return query_set.distinct()

    def perform_update(self, serializer):
        save_without_immutable_changes(serializer, ['appointment', 'source', 'created_by'])


# AppointmentAnswer APIs:
# - select: must filter by question
# - insert: must specify question id that the user has permission to access, recorded_by is
#   set to the user
# - update: question cannot be changed

class AppointmentAnswerListCreate(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AppointmentAnswerSerializer

    def get_queryset(self):
        user = self.request.user
        question = self.request.query_params.get("question")
        query_set = AppointmentAnswer.objects.filter(
            question__appointment__in = visible_appointments(user))

        if not question:
            raise serializers.ValidationError({'question':'This field is required.'})
        query_set = query_set.filter(question = question)
        return query_set.distinct()

    def perform_create(self, serializer):
        user = self.request.user
        question = serializer.validated_data["question"]
        if not visible_appointments(user).filter(id = question.appointment_id).exists():
            raise serializers.ValidationError({'question':'You do not have access.'})

        serializer.save(recorded_by = user)

class AppointmentAnswerRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AppointmentAnswerSerializer

    def get_queryset(self):
        user = self.request.user
        question = self.request.query_params.get("question")
        query_set = AppointmentAnswer.objects.filter(
            question__appointment__in = visible_appointments(user))
        if question:
            query_set = query_set.filter(question = question)
        return query_set.distinct()

    def perform_update(self, serializer):
        save_without_immutable_changes(serializer, ['question'])


# AppointmentAccess APIs:
# - select: can only see access for own appointments or given to user, can filter by
#   appointment, support_link
# - insert: must specify appointment id of the user's own appointment
# - update: appointment, support_link, granted_at cannot be changed

# helper function: returns set of appointment access records that user can access
def visible_appointment_access(user):
    return AppointmentAccess.objects.filter(
            Q(appointment__patient_profile__user = user) |
            Q(support_link__supporter_user = user)
        )

class AppointmentAccessListCreate(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AppointmentAccessSerializer

    def get_queryset(self):
        user = self.request.user
        appointment = self.request.query_params.get("appointment")
        support_link = self.request.query_params.get("support_link")
        query_set = visible_appointment_access(user)
        if appointment:
            query_set = query_set.filter(appointment = appointment)
        if support_link:
            query_set = query_set.filter(support_link = support_link)
        return query_set.distinct()

    def perform_create(self, serializer):
        user = self.request.user
        appointment = serializer.validated_data["appointment"]
        if appointment.patient_profile.user_id != user.id:
            raise serializers.ValidationError({'appointment':'You do not have access.'})

        serializer.save()

class AppointmentAccessRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AppointmentAccessSerializer

    def get_queryset(self):
        user = self.request.user
        appointment = self.request.query_params.get("appointment")
        support_link = self.request.query_params.get("support_link")
        query_set = visible_appointment_access(user)
        if appointment:
            query_set = query_set.filter(appointment = appointment)
        if support_link:
            query_set = query_set.filter(support_link = support_link)
        return query_set.distinct()

    def perform_update(self, serializer):
        save_without_immutable_changes(serializer, ['appointment', 'support_link', 'granted_at'])
