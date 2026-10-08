from django.urls import path, include

from appointment import views

access_patterns = [
    path("<uuid:appointment_pk>/access", views.GrantAccessView.as_view(), name = "grant-access"),
    path("<uuid:appointment_pk>/access/<uuid:grant_pk>/revoke", views.RevokeAccessView.as_view(), name = "revoke-access")
]

api_patterns = [
    path('appointment/', views.AppointmentListCreate.as_view(), name ='read_create_appointment'),
    path('appointment/<str:pk>', views.AppointmentRetrieveUpdateDestroy.as_view(), name ='update_appointment'),
    path('appointmentQuestion/', views.AppointmentQuestionListCreate.as_view(), name ='read_create_appointment_question'),
    path('appointmentQuestion/<str:pk>', views.AppointmentQuestionRetrieveUpdateDestroy.as_view(), name ='update_appointment_question'),
    path('appointmentAnswer/', views.AppointmentAnswerListCreate.as_view(), name ='read_create_appointment_answer'),
    path('appointmentAnswer/<str:pk>', views.AppointmentAnswerRetrieveUpdateDestroy.as_view(), name ='update_appointment_answer'),
    path('appointmentAnswer/<str:pk>/recording', views.AppointmentAnswerRecording.as_view(), name ='read_appointment_answer_recording'),
    path('appointmentAccess/', views.AppointmentAccessListCreate.as_view(), name ='read_create_appointment_access'),
    path('appointmentAccess/<str:pk>', views.AppointmentAccessRetrieveUpdateDestroy.as_view(), name ='update_appointment_access')
]

urlpatterns = [
    path("appointments/", include(access_patterns)),
    path("api/", include(api_patterns)),
]