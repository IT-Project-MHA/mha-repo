from django.urls import path
from . import views
from .views import *

# "tempPatientProfile..." are temporary view classes.
# They must be removed once \accounts APIs are written.

urlpatterns = [
    path('tempPatientProfile/', 
         views.ProfileListCreate.as_view(), 
         name ='get_profiles'),
    path('tempPatientProfile/<str:pk>', 
         views.ProfileRetrieveUpdateDestroy.as_view(), 
         name ='create_profile'),
    path('prescription/', 
         views.PrescriptionListCreate.as_view(), 
         name = 'read_create_prescriptions'),
    path('prescription/<str:pk>', 
         views.PrescriptionRetrieveUpdateDestroy.as_view(), 
         name ='update_prescription'),
    path('assessment/', 
         views.AssessmentListCreate.as_view(), 
         name = 'read_create_assessments'),
    path('Assessment/<str:pk>', 
         views.AssessmentRetrieveUpdateDestroy.as_view(), 
         name ='update_assessment')
]