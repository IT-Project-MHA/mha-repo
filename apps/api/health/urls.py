from django.urls import path
from . import views
from .views import *

urlpatterns = [
    path('prescription/', 
         views.PrescriptionListCreate.as_view(), 
         name = 'read_create_prescriptions_by_patient_profile'),
    path('prescription/<str:pk>', 
         views.PrescriptionRetrieveUpdateDestroy.as_view(), 
         name ='update_prescription_by_id'),
    path('tempPatientProfile/', 
         views.ProfileListCreate.as_view(), 
         name ='get_profiles'),
    path('tempPatientProfile/<str:pk>', 
         views.ProfileRetrieveUpdateDestroy.as_view(), 
         name ='create_profile')
]