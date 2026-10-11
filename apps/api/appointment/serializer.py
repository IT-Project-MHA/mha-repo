from rest_framework import serializers
from django.urls import reverse
from mpowered_api.validators import validate_not_future, validate_not_past
from .models import Appointment, AppointmentQuestion, AppointmentAnswer, \
   AppointmentAccess

MAX_RECORDING_SIZE = 20 * 1024 * 1024 # 20 MB

class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = '__all__'
        # deleted_at is only set by deleting the appointment
        read_only_fields = ['patient_profile', 'created_by', 'deleted_at']

    def validate_scheduled_date(self, scheduled_date):
        return validate_not_past(scheduled_date)

class AppointmentQuestionSerializer(serializers.ModelSerializer):
    # the question's answer, so a page gets the questions & their answers in one request
    answer = serializers.SerializerMethodField()

    class Meta:
        model = AppointmentQuestion
        fields = '__all__'
        read_only_fields = ['created_by', 'deleted_at']

    # null when the question has no answer, or its answer was deleted
    def get_answer(self, question):
        answer = getattr(question, 'question_answer', None)
        if answer is None or answer.is_deleted():
            return None
        return AppointmentAnswerSerializer(answer, context = self.context).data

class AppointmentAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppointmentAnswer
        fields = '__all__'
        read_only_fields = ['recorded_by', 'deleted_at']
        # one answer per question is checked by the view instead, so a soft deleted answer doesn't
        # stop a new one being recorded
        extra_kwargs = {'question': {'validators': []}}

    def validate_recording_file(self, recording_file):
        if recording_file is None:
            return recording_file
        content_type = getattr(recording_file, 'content_type', '') or ''
        if not content_type.startswith('audio/'):
            raise serializers.ValidationError('File must be an audio recording.')
        if recording_file.size > MAX_RECORDING_SIZE:
            raise serializers.ValidationError('Recording must be 20 MB or smaller.')
        return recording_file

    # returns authenticated download URL
    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.recording_file:
            url = reverse('read_appointment_answer_recording', args = [instance.pk])
            request = self.context.get('request')
            data['recording_file'] = request.build_absolute_uri(url) if request else url
        return data

class AppointmentAccessSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppointmentAccess
        fields = '__all__'
        read_only_fields = ['granted_at']

    def validate_revoked_at(self, revoked_at):
        return validate_not_future(revoked_at)
    
class GrantAccessSerializer(serializers.Serializer):
    support_link_id = serializers.UUIDField()
    can_add_questions = serializers.BooleanField(default = False)
    can_record_answers = serializers.BooleanField(default = False)


class AccessGrantSerializer(serializers.ModelSerializer):

    class Meta:
        model = AppointmentAccess
        fields = ["id", "support_link", "can_add_questions", "can_record_answers", "granted_at", "revoked_at"]