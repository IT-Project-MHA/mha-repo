from django.urls import include, path

from accounts import views

# Log-in, sign-up and devices
auth_patterns = [
    path("request-code", views.RequestCodeView.as_view(), name = "request-code"),
    path("verify-code", views.VerifyCodeView.as_view(), name = "verify-code"),
    path("register", views.RegisterView.as_view(), name = "register"),
    path("login", views.LoginView.as_view(), name = "login"),
    path("logout", views.LogoutView.as_view(), name = "logout"),
    path("devices", views.DeviceListView.as_view(), name = "devices"),
    path("devices/<uuid:device_pk>/revoke", views.RevokeDeviceView.as_view(), name = "revoke-device"),
    path("reset-pin", views.ResetPinView.as_view(), name = "reset-pin")
]

# Account data
api_patterns = [
    path('user/', views.UserList.as_view(), name ='read_user'),
    path('user/<str:pk>', views.UserRetrieveUpdateDestroy.as_view(), name ='update_user'),
    
    path('patientProfile/', views.PatientProfileListCreate.as_view(), name ='read_create_patient_profile'),
    path('patientProfile/<str:pk>', views.PatientProfileRetrieveUpdateDestroy.as_view(), name ='update_patient_profile'),
    
    path('userSettings/', views.UserSettingsListCreate.as_view(), name ='read_create_user_settings'),
    path('userSettings/<str:pk>', views.UserSettingsRetrieveUpdateDestroy.as_view(), name ='update_user_settings'),
    
    path('supportLink/', views.SupportLinkListCreate.as_view(), name ='read_create_support_link'),
    path('supportLink/<str:pk>', views.SupportLinkRetrieveUpdateDestroy.as_view(), name ='update_support_link'),
    
    path('termsAndPrivacy/', views.TermsAndPrivacyListCreate.as_view(), name ='read_create_terms_and_privacy'),
    path('termsAndPrivacy/<str:pk>', views.TermsAndPrivacyRetrieve.as_view(), name ='retrieve_terms_and_privacy'),
    
    path('trustedDevice/', views.TrustedDeviceList.as_view(), name ='read_trusted_device'),
    path('trustedDevice/<str:pk>', views.TrustedDeviceRetrieve.as_view(), name ='retrieve_trusted_device'),
]

urlpatterns = [
    path("auth/", include(auth_patterns)),
    path("api/", include(api_patterns)),
]