from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import generics
from rest_framework import status
from rest_framework.views import APIView
from .models import QuestionOption, QuestionOptionOrdered
from .serializer import *
from datetime import date

# QuestionOption APIs:
# - can read records filtered by app_section in the URL in the form: ?app_section=...
# - given app_section, can read records filtered by adding question_key in the URL 
#   in the form: ?question_key=...

class QuestionOptionListCreate(generics.ListCreateAPIView):
    queryset = QuestionOption.objects.all()
    serializer_class = QuestionOptionSerializer

    def get_queryset(self):
        app_section = self.request.query_params.get("app_section")
        question_key = self.request.query_params.get("question_key")
        if app_section:
            if question_key:
                return QuestionOption.objects.filter(app_section=app_section, 
                                                     question_key=question_key)
            else:
                return QuestionOption.objects.filter(app_section=app_section)
        else:
            return QuestionOption.objects.all()

class QuestionOptionRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = QuestionOption.objects.all()
    serializer_class = QuestionOptionSerializer
    lookup_field = "pk"

# QuestionOptionOrdered APIs:
# - can read records filtered by app_section in the URL in the form: ?app_section=...
# - given app_section, can read records filtered by adding question_key in the URL 
#   in the form: ?question_key=...

class QuestionOptionOrderedListCreate(generics.ListCreateAPIView):
    queryset = QuestionOptionOrdered.objects.all()
    serializer_class = QuestionOptionOrderedSerializer

    def get_queryset(self):
        question_key = self.request.query_params.get("question_key")
        if question_key:
            return QuestionOptionOrdered.objects.filter(question_key=question_key)
        else:
            return QuestionOptionOrdered.objects.all()

class QuestionOptionOrderedRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = QuestionOptionOrdered.objects.all()
    serializer_class = QuestionOptionOrderedSerializer
    lookup_field = "pk"