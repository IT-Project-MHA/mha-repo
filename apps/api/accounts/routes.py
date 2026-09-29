from django.urls import path

from accounts.controllers import RequestCodeController, VerifyCodeController

app_name = "auth"

urlpatterns = [
    path("request-code", RequestCodeView.as_view(), name = "request-code"),
    path("verify-code", VerifyCodeView.as_view(), name = "verify-code"),
]