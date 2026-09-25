from rest_framework import serializers
from .models import Prescription, Assessment, MyPain, MyMovement, MyPersonalCare, \
   MySocialHealth, MyManagement, GeneratedDocument

class PrescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prescription
        fields = ['name','dosage','strength','started_on','stopped_on','notes','strength_unit','form','frequency','frequency_unit']

class AssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assessment
        fields = '__all__'

class MyPainSerializer(serializers.ModelSerializer):
    class Meta:
        model = MyPain
        fields = '__all__'

class MyMovementSerializer(serializers.ModelSerializer):
    class Meta:
        model = MyMovement
        fields = '__all__'

class MySocialHealthSerializer(serializers.ModelSerializer):
    class Meta:
        model = MySocialHealth
        fields = '__all__'

class MyManagementSerializer(serializers.ModelSerializer):
    class Meta:
        model = MyManagement
        fields = '__all__'

class GeneratedDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeneratedDocument
        fields = '__all__'