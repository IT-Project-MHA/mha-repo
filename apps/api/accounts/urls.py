from django.urls import path
from . import views
from .views import *

urlpatterns = [
    path('user/',
         views.UserListCreate.as_view(),
         name ='read_create_user'),
    path('user/<str:pk>',
         views.UserRetrieveUpdateDestroy.as_view(),
         name ='update_user'),
    path('patientProfile/',
         views.PatientProfileListCreate.as_view(),
         name ='read_create_patient_profile'),
    path('patientProfile/<str:pk>',
         views.PatientProfileRetrieveUpdateDestroy.as_view(),
         name ='update_patient_profile'),
    path('userSettings/',
         views.UserSettingsListCreate.as_view(),
         name ='read_create_user_settings'),
    path('userSettings/<str:pk>',
         views.UserSettingsRetrieveUpdateDestroy.as_view(),
         name ='update_user_settings'),
    path('supportLink/',
         views.SupportLinkListCreate.as_view(),
         name ='read_create_support_link'),
    path('supportLink/<str:pk>',
         views.SupportLinkRetrieveUpdateDestroy.as_view(),
         name ='update_support_link'),
    path('termsAndPrivacy/',
         views.TermsAndPrivacyListCreate.as_view(),
         name ='read_create_terms_and_privacy'),
    path('termsAndPrivacy/<str:pk>',
         views.TermsAndPrivacyRetrieveUpdateDestroy.as_view(),
         name ='update_terms_and_privacy')
]
