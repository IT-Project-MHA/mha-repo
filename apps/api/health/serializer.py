from rest_framework import serializers
from .models import Prescription, Assessment, MyPain, MyMovement, MyPersonalCare, \
   MySocialHealth, MyManagement
from mpowered_api.validators import validate_not_future, current_week_starting, \
   current_value

class PrescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prescription
        fields = '__all__'
        read_only_fields = ['patient_profile']

    def validate_dosage(self, dosage):
        if dosage < 1:
            raise serializers.ValidationError('Dosage must be at least 1.')
        return dosage

    def validate_frequency(self, frequency):
        if frequency < 1:
            raise serializers.ValidationError('Frequency must be at least 1.')
        return frequency

    # stopped_on cannot be before started_on
    def validate(self, data):
        started_on = current_value(self, data, 'started_on')
        stopped_on = current_value(self, data, 'stopped_on')
        if started_on and stopped_on and stopped_on < started_on:
            raise serializers.ValidationError(
                {'stopped_on':'Stop date cannot be before start date.'})
        return data

class AssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assessment
        fields = '__all__'
        read_only_fields = ['patient_profile']

    # week_starting must be a Monday, & no later than the current week
    def validate_week_starting(self, week_starting):
        if week_starting.weekday() != 0:
            raise serializers.ValidationError('Week must start on a Monday.')
        if week_starting > current_week_starting():
            raise serializers.ValidationError('Week cannot be after the current week.')
        return week_starting

    def validate_submitted_at(self, submitted_at):
        return validate_not_future(submitted_at)

# assessment task serializers: completed_at cannot be in the future
# score is computed from QuestionOptionOrdered fields after save
class AssessmentTaskSerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        read_only_fields = ['score']

    def validate_completed_at(self, completed_at):
        return validate_not_future(completed_at)

    def calculate_score(self, instance):
        return None

    def create(self, validated_data):
        instance = super().create(validated_data)
        score = self.calculate_score(instance)
        if score is not None:
            instance.score = score
            instance.save(update_fields=['score'])
        return instance

    def update(self, instance, validated_data):
        instance = super().update(instance, validated_data)
        score = self.calculate_score(instance)
        if score is not None:
            instance.score = score
            instance.save(update_fields=['score'])
        return instance

class MyPainSerializer(AssessmentTaskSerializer):
    class Meta(AssessmentTaskSerializer.Meta):
        model = MyPain

    # pain scores must be consistent: mildest <= average <= worst, mildest <= current <= worst
    def validate(self, data):
        current = current_value(self, data, 'current')
        worst = current_value(self, data, 'worst')
        average = current_value(self, data, 'average')
        mildest = current_value(self, data, 'mildest')
        errors = {}
        if worst is not None and mildest is not None and mildest > worst:
            errors['mildest'] = 'Mildest pain cannot be higher than worst pain.'
        if average is not None:
            if worst is not None and average > worst:
                errors['average'] = 'Average pain cannot be higher than worst pain.'
            elif mildest is not None and average < mildest:
                errors['average'] = 'Average pain cannot be lower than mildest pain.'
        if current is not None:
            if worst is not None and current > worst:
                errors['current'] = 'Current pain cannot be higher than worst pain.'
            elif mildest is not None and current < mildest:
                errors['current'] = 'Current pain cannot be lower than mildest pain.'
        if errors:
            raise serializers.ValidationError(errors)
        return data

class MyMovementSerializer(AssessmentTaskSerializer):
    class Meta(AssessmentTaskSerializer.Meta):
        model = MyMovement

    def calculate_score(self, instance):
        score = sum(
            getattr(instance, f).score
            for f in ['walking', 'sitting', 'lifting', 'standing']
            if getattr(instance, f)
        )
        score += sum(item.score for item in instance.general_impacts.all())
        return score

class MyPersonalCareSerializer(AssessmentTaskSerializer):
    class Meta(AssessmentTaskSerializer.Meta):
        model = MyPersonalCare

    def calculate_score(self, instance):
        score = sum(
            getattr(instance, f).score
            for f in ['personal_care', 'sleeping']
            if getattr(instance, f)
        )
        score += sum(item.score for item in instance.general_activities_impact.all())
        return score

class MySocialHealthSerializer(AssessmentTaskSerializer):
    class Meta(AssessmentTaskSerializer.Meta):
        model = MySocialHealth

    def calculate_score(self, instance):
        return sum(
            getattr(instance, f).score
            for f in ['social_life', 'travelling', 'overall_mood']
            if getattr(instance, f)
        )

class MyManagementSerializer(AssessmentTaskSerializer):
    class Meta(AssessmentTaskSerializer.Meta):
        model = MyManagement

    def calculate_score(self, instance):
        return instance.exercise.score if instance.exercise else 0

    # medication must only contain prescriptions of the assessment's patient
    def validate(self, data):
        assessment = data.get('assessment') or getattr(self.instance, 'assessment', None)
        medication = data.get('medication', [])
        if assessment and any(prescription.patient_profile_id != assessment.patient_profile_id
                              for prescription in medication):
            raise serializers.ValidationError(
                {'medication':'Prescriptions must belong to the assessment\'s patient.'})
        return data
