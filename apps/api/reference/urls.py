from django.urls import path
from . import views
from .views import *

urlpatterns = [
    path('questionOption/', 
         views.QuestionOptionList.as_view(), 
         name ='read_question_option'),
    path('questionOption/<str:pk>', 
         views.QuestionOptionRetrieve.as_view(), 
         name ='read_question_option_detail'),
    path('questionOptionOrdered/', 
         views.QuestionOptionOrderedList.as_view(), 
         name = 'read_question_option_ordered'),
    path('questionOptionOrdered/<str:pk>', 
         views.QuestionOptionOrderedRetrieve.as_view(), 
         name ='read_question_option_ordered_detail')
]