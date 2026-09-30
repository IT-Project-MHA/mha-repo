from rest_framework import serializers
from .models import Prescription, Assessment, MyPain, MyMovement, MyPersonalCare, \
   MySocialHealth, MyManagement

class PrescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prescription
        fields = '__all__'
        read_only_fields = ['patient_profile']

class AssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assessment
        fields = '__all__'
        read_only_fields = ['patient_profile']

class MyPainSerializer(serializers.ModelSerializer):
    class Meta:
        model = MyPain
        fields = '__all__'

class MyMovementSerializer(serializers.ModelSerializer):
    class Meta:
        model = MyMovement
        fields = '__all__'

class MyPersonalCareSerializer(serializers.ModelSerializer):
    class Meta:
        model = MyPersonalCare
        fields = '__all__'

class MySocialHealthSerializer(serializers.ModelSerializer):
    class Meta:
        model = MySocialHealth
        fields = '__all__'

class MyManagementSerializer(serializers.ModelSerializer):
    class Meta:
        model = MyManagement
        fields = '__all__'
