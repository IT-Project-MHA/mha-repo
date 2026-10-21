from rest_framework import serializers
from .models import QuestionOption, QuestionOptionOrdered

class QuestionOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionOption
        fields = '__all__'

class QuestionOptionOrderedSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionOptionOrdered
        fields = '__all__'