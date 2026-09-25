from django.urls import path
from .views import *

urlpatterns = [
    path('prescription/', get_prescriptions, name = 'get_prescription'),
    path('prescription/create', create_prescription, name ='create_prescription')
]