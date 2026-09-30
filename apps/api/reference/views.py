from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import generics
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from rest_framework import serializers
from .models import QuestionOption, QuestionOptionOrdered
from .serializer import *
from datetime import date

# instructions:
# All views are protected by authenticated user id (can only see records where patient_profile
# is user's own, or who user supports), for relevant tables.

# Attributes that can be filtered are specified in the comments. To filter by attribute, put 
# in the URL ?attribute_name=value. For multiple attributes: 
# ?attribute_name1=value&?attribute_name2=value...


# QuestionOption APIs:
# - select: must filter by app_section, question_key

class QuestionOptionListCreate(generics.ListCreateAPIView):
    serializer_class = QuestionOptionSerializer

    def get_queryset(self):
        app_section = self.request.query_params.get("app_section")
        question_key = self.request.query_params.get("question_key")
        if not app_section:
            raise serializers.ValidationError({'app_section':'This field is required.'})
        if not question_key:
            raise serializers.ValidationError({'question_key':'This field is required.'}) 
        return QuestionOption.objects.filter(app_section=app_section, 
                                             question_key=question_key)


class QuestionOptionRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = QuestionOption.objects.all()
    serializer_class = QuestionOptionSerializer

# QuestionOptionOrdered APIs:
# - select: must filter by app_section, question_key

class QuestionOptionOrderedListCreate(generics.ListCreateAPIView):
    serializer_class = QuestionOptionSerializer

    def get_queryset(self):
        app_section = self.request.query_params.get("app_section")
        question_key = self.request.query_params.get("question_key")
        if not app_section:
            raise serializers.ValidationError({'app_section':'This field is required.'})
        if not question_key:
            raise serializers.ValidationError({'question_key':'This field is required.'}) 
        return QuestionOptionOrdered.objects.filter(app_section=app_section, 
                                             question_key=question_key)

class QuestionOptionOrderedRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = QuestionOptionOrdered.objects.all()
    serializer_class = QuestionOptionOrderedSerializer