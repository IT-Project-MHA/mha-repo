from django.shortcuts import render
from django.http import FileResponse, Http404
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, SAFE_METHODS
from django.db.models import Q, Max
from rest_framework import serializers
from .models import Appointment, AppointmentQuestion, AppointmentAnswer, \
   AppointmentAccess
from accounts.models import SupportLink
from accounts.views import own_patient_profile
from .serializer import *
from mpowered_api.immutable import save_without_immutable_changes
from mpowered_api.protected import destroy_or_reject_protected

# instructions:
# All views are protected by authenticated user id (can only see records where patient_profile
# is user's own, or who user supports), for relevant tables.

# To filter by attribute, put
# in the URL ?attribute_name=value. For multiple attributes:
# ?attribute_name1=value&?attribute_name2=value...

# Attributes that are read only are specified in it's serializer. Sending a different value for
# them in an update request returns a 400 error.

# Records that other records depend on cannot be deleted; deleting them returns a 409 error.

# Who can insert/update/delete is specified in the comments. Records the user can see but is not
# allowed to update/delete return a 404 error for those requests.



# helper function: checks if user has valid (not revoked, active support link) access to
# appointment with the given permission flag, e.g. 'can_add_questions', 'can_record_answers'
def has_appointment_access(user, appointment, flag):
    return AppointmentAccess.objects.filter(
            appointment = appointment,
            support_link__supporter_user = user,
            support_link__status = SupportLink.Status.ACTIVE,
            revoked_at__isnull = True,
            **{flag: True}
        ).exists()

# helper function: checks if user is the patient of the appointment
def is_appointment_patient(user, appointment):
    return appointment.patient_profile.user_id == user.id


# Appointment APIs:

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
        serializer.save(patient_profile = own_patient_profile(user), created_by = user)

class AppointmentRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AppointmentSerializer

    def get_queryset(self):
        user = self.request.user
        query_patient_profile = self.request.query_params.get("patient_profile")
        query_status = self.request.query_params.get("status")
        scheduled_date = self.request.query_params.get("scheduled_date")
        query_set = visible_appointments(user)

        # user can only update their own appointments where they are a patient
        if self.request.method not in SAFE_METHODS:
            query_set = query_set.filter(patient_profile__user = user)
        if query_patient_profile:
            query_set = query_set.filter(patient_profile = query_patient_profile)
        if query_status:
            query_set = query_set.filter(status = query_status)
        if scheduled_date:
            query_set = query_set.filter(scheduled_date = scheduled_date)
        return query_set.distinct()

    def perform_destroy(self, instance):
        destroy_or_reject_protected(instance)



# AppointmentQuestion APIs:
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
        last_index = AppointmentQuestion.objects.filter(
            appointment = appointment).aggregate(Max('order_index'))['order_index__max']
        order_index = (last_index + 1) if last_index is not None else 0

        if is_appointment_patient(user, appointment):
            source = serializer.validated_data.get("source", AppointmentQuestion.Source.PATIENT)
            if source == AppointmentQuestion.Source.SUPPORT:
                raise serializers.ValidationError(
                    {'source':'Patients cannot create support questions.'})
            serializer.save(created_by = user, source = source, order_index = order_index)
        elif has_appointment_access(user, appointment, 'can_add_questions'):
            source = serializer.validated_data.get("source", AppointmentQuestion.Source.SUPPORT)
            if source == AppointmentQuestion.Source.PATIENT:
                raise serializers.ValidationError(
                    {'source':'Supporters cannot create patient questions.'})
            serializer.save(created_by = user, source = source, order_index = order_index)
        else:
            raise serializers.ValidationError({'appointment':'You do not have access.'})

class AppointmentQuestionRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AppointmentQuestionSerializer

    def get_queryset(self):
        user = self.request.user
        appointment = self.request.query_params.get("appointment")
        query_set = AppointmentQuestion.objects.filter(
            appointment__in = visible_appointments(user))
        if self.request.method not in SAFE_METHODS:
            query_set = query_set.filter(
                Q(appointment__patient_profile__user = user) |
                Q(created_by = user,
                  appointment__access_grants__support_link__supporter_user = user,
                  appointment__access_grants__support_link__status = SupportLink.Status.ACTIVE,
                  appointment__access_grants__revoked_at__isnull = True,
                  appointment__access_grants__can_add_questions = True))
        if appointment:
            query_set = query_set.filter(appointment = appointment)
        return query_set.distinct()

    def perform_update(self, serializer):
        save_without_immutable_changes(serializer, ['appointment', 'source'])

    def perform_destroy(self, instance):
        destroy_or_reject_protected(instance)



# AppointmentAnswer APIs:
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
        appointment = question.appointment
        if not (is_appointment_patient(user, appointment) or
                has_appointment_access(user, appointment, 'can_record_answers')):
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
        if self.request.method == 'DELETE':
            query_set = query_set.filter(question__appointment__patient_profile__user = user)
        elif self.request.method not in SAFE_METHODS:
            query_set = query_set.filter(
                Q(question__appointment__patient_profile__user = user) |
                Q(question__appointment__access_grants__support_link__supporter_user = user,
                  question__appointment__access_grants__support_link__status =
                      SupportLink.Status.ACTIVE,
                  question__appointment__access_grants__revoked_at__isnull = True,
                  question__appointment__access_grants__can_record_answers = True))
        if question:
            query_set = query_set.filter(question = question)
        return query_set.distinct()

    # file needs to be manually deleted from storage
    def perform_update(self, serializer):
        old_recording = serializer.instance.recording_file.name
        save_without_immutable_changes(serializer, ['question'])
        if old_recording and old_recording != serializer.instance.recording_file.name:
            serializer.instance.recording_file.storage.delete(old_recording)

    def perform_destroy(self, instance):
        recording = instance.recording_file
        instance.delete()
        if recording:
            recording.storage.delete(recording.name)

# AppointmentAnswer recording download API:
# - select: returns the answer's audio file, for users who can see the answer
class AppointmentAnswerRecording(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return AppointmentAnswer.objects.filter(
            question__appointment__in = visible_appointments(user)).distinct()

    def retrieve(self, request, *args, **kwargs):
        answer = self.get_object()
        if not answer.recording_file:
            raise Http404('This answer has no recording.')
        return FileResponse(answer.recording_file.open('rb'))


# AppointmentAccess APIs:

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
        if not is_appointment_patient(user, appointment):
            raise serializers.ValidationError({'appointment':'You do not have access.'})

        support_link = serializer.validated_data["support_link"]
        if support_link.patient_profile_id != appointment.patient_profile_id or \
           support_link.status != SupportLink.Status.ACTIVE:
            raise serializers.ValidationError(
                {'support_link':'Support link must be an active link of the appointment\'s '
                 'patient.'})

        serializer.save()

class AppointmentAccessRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AppointmentAccessSerializer

    def get_queryset(self):
        user = self.request.user
        appointment = self.request.query_params.get("appointment")
        support_link = self.request.query_params.get("support_link")
        query_set = visible_appointment_access(user)
        if self.request.method not in SAFE_METHODS:
            query_set = query_set.filter(appointment__patient_profile__user = user)
        if appointment:
            query_set = query_set.filter(appointment = appointment)
        if support_link:
            query_set = query_set.filter(support_link = support_link)
        return query_set.distinct()

    def perform_update(self, serializer):
        save_without_immutable_changes(serializer, ['appointment', 'support_link'])

