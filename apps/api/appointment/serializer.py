from rest_framework import serializers
from .models import Appointment, AppointmentQuestion, AppointmentAnswer, \
   AppointmentAccess

class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = '__all__'
        read_only_fields = ['patient_profile', 'created_by']

class AppointmentQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppointmentQuestion
        fields = '__all__'
        read_only_fields = ['created_by']

class AppointmentAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppointmentAnswer
        fields = '__all__'
        read_only_fields = ['recorded_by']

class AppointmentAccessSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppointmentAccess
        fields = '__all__'
