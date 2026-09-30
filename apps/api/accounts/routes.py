from django.urls import path

from accounts.controllers import RequestCodeController, VerifyCodeController, RegisterController

app_name = "auth"

urlpatterns = [
    path("request-code", RequestCodeController.as_view(), name = "request-code"),
    path("verify-code", VerifyCodeController.as_view(), name = "verify-code"),
    path("register", RegisterController.as_view(), name = "register"),
]