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

    # medication must only contain prescriptions of the assessment's patient
    def validate(self, data):
        assessment = data.get('assessment') or getattr(self.instance, 'assessment', None)
        medication = data.get('medication', [])
        if assessment and any(prescription.patient_profile_id != assessment.patient_profile_id
                              for prescription in medication):
            raise serializers.ValidationError(
                {'medication':'Prescriptions must belong to the assessment\'s patient.'})
        return data
