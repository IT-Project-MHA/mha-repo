from django.urls import path
from . import views
from .views import *

urlpatterns = [
    path('questionOption/', 
         views.QuestionOptionListCreate.as_view(), 
         name ='read_create_question_option'),
    path('questionOption/<str:pk>', 
         views.QuestionOptionRetrieveUpdateDestroy.as_view(), 
         name ='edit_question_option'),
    path('questionOptionOrdered/', 
         views.QuestionOptionOrderedListCreate.as_view(), 
         name = 'read_create_question_option_ordered'),
    path('questionOptionOrdered/<str:pk>', 
         views.QuestionOptionOrderedRetrieveUpdateDestroy.as_view(), 
         name ='update_question_option_ordered')
]