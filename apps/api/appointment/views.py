from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import can_edit_patient_data

from appointment import grants
from appointment.models import Appointment
from appointment.serializers import AppointmentAccessSerializer, GrantAccessSerializer


def get_own_appointment(user, appointment_pk):
    
    appointment = Appointment.objects.filter(pk = appointment_pk, deleted_at__isnull = True).first()

    if appointment is None or not can_edit_patient_data(user, appointment.patient_profile):
        return None

    return appointment


class GrantAccessView(APIView):
    # POST /appointments/{id}/access
    # Patient gives access to appointment or changes access

    permission_classes = [IsAuthenticated]

    def post(self, request, appointment_pk):

        appointment = get_own_appointment(request.user, appointment_pk)

        if appointment is None:
            return Response({"detail": "not_found"}, status = status.HTTP_404_NOT_FOUND)

        serializer = GrantAccessSerializer(data = request.data)
        serializer.is_valid(raise_exception = True)
        data = serializer.validated_data

        try:
            grant, created = grants.grant_access(
                appointment = appointment,
                support_link_id = data["support_link_id"],
                can_add_questions = data["can_add_questions"],
                can_record_answers = data["can_record_answers"],
            )
        except grants.GrantError as error:
            return Response({"detail": error.reason}, status = status.HTTP_400_BAD_REQUEST)

        if created:
            code = status.HTTP_201_CREATED
        else:
            code = status.HTTP_200_OK

        return Response(AppointmentAccessSerializer(grant).data, status = code)


class RevokeAccessView(APIView):
    # POST /appointments/{id}/access/{grantid}/revoke
    # Patient takes a supporter's access to this appointment away

    permission_classes = [IsAuthenticated]

    def post(self, request, appointment_pk, grant_pk):
        appointment = get_own_appointment(request.user, appointment_pk)

        if appointment is None or not grants.revoke_access(appointment, grant_pk):
            return Response({"detail": "not_found"}, status = status.HTTP_404_NOT_FOUND)

        return Response(status = status.HTTP_204_NO_CONTENT)