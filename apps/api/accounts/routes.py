from django.urls import path

from accounts.controllers import RequestCodeController, VerifyCodeController, RegisterController, LoginController, LogoutController, DeviceListController, RevokeDeviceController

app_name = "auth"

urlpatterns = [
    path("request-code", RequestCodeController.as_view(), name = "request-code"),
    path("verify-code", VerifyCodeController.as_view(), name = "verify-code"),

    path("register", RegisterController.as_view(), name = "register"),

    path("login", LoginController.as_view(), name = "login"),
    path("logout", LogoutController.as_view(), name = "logout"),

   path("devices", DeviceListController.as_view(), name = "devices"),
   path("devices/<uuid:device_pk>/revoke", RevokeDeviceController.as_view(), name = "revoke-device"),
]