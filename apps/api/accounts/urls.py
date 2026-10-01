from django.urls import path

from accounts.views import RequestCodeView, VerifyCodeView, RegisterView, LoginView, LogoutView, DeviceListView, RevokeDeviceView, ResetPinView

app_name = "auth"

urlpatterns = [
    path("request-code", RequestCodeView.as_view(), name = "request-code"),
    path("verify-code", VerifyCodeView.as_view(), name = "verify-code"),

    path("register", RegisterView.as_view(), name = "register"),

    path("login", LoginView.as_view(), name = "login"),
    path("logout", LogoutView.as_view(), name = "logout"),

    path("devices", DeviceListView.as_view(), name = "devices"),
    path("devices/<uuid:device_pk>/revoke", RevokeDeviceView.as_view(), name = "revoke-device"),

    path("reset-pin", ResetPinView.as_view(), name = "reset-pin")
]