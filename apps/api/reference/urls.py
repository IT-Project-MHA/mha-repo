from django.urls import path
from . import views
from .views import *

urlpatterns = [
    path('questionOption/', 
         views.QuestionOptionListCreate.as_view(), 
         name ='get_profiles'),
    path('questionOption/<str:pk>', 
         views.QuestionOptionRetrieveUpdateDestroy.as_view(), 
         name ='create_profile'),
    path('questionOptionOrdered/', 
         views.QuestionOptionOrderedListCreate.as_view(), 
         name = 'read_create_prescriptions'),
    path('questionOptionOrdered/<str:pk>', 
         views.QuestionOptionOrderedRetrieveUpdateDestroy.as_view(), 
         name ='update_prescription')
]