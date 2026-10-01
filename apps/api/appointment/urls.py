from django.urls import path
from . import views
from .views import *

urlpatterns = [
    path('appointment/',
         views.AppointmentListCreate.as_view(),
         name ='read_create_appointment'),
    path('appointment/<str:pk>',
         views.AppointmentRetrieveUpdateDestroy.as_view(),
         name ='update_appointment'),
    path('appointmentQuestion/',
         views.AppointmentQuestionListCreate.as_view(),
         name ='read_create_appointment_question'),
    path('appointmentQuestion/<str:pk>',
         views.AppointmentQuestionRetrieveUpdateDestroy.as_view(),
         name ='update_appointment_question'),
    path('appointmentAnswer/',
         views.AppointmentAnswerListCreate.as_view(),
         name ='read_create_appointment_answer'),
    path('appointmentAnswer/<str:pk>',
         views.AppointmentAnswerRetrieveUpdateDestroy.as_view(),
         name ='update_appointment_answer'),
    path('appointmentAccess/',
         views.AppointmentAccessListCreate.as_view(),
         name ='read_create_appointment_access'),
    path('appointmentAccess/<str:pk>',
         views.AppointmentAccessRetrieveUpdateDestroy.as_view(),
         name ='update_appointment_access')
]
