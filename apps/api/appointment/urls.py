from django.urls import path

from appointment.views import GrantAccessView, RevokeAccessView

app_name = "appointments"

urlpatterns = [
    path("<uuid:appointment_pk>/access", GrantAccessView.as_view(), name = "grant-access"),
    path("<uuid:appointment_pk>/access/<uuid:grant_pk>/revoke", RevokeAccessView.as_view(), name = "revoke-access")
]