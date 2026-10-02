from rest_framework import serializers
from appointment.models import AppointmentAccess


class GrantAccessSerializer(serializers.Serializer):
    support_link_id = serializers.UUIDField()
    can_add_questions = serializers.BooleanField(default = False)
    can_record_answers = serializers.BooleanField(default = False)


class AppointmentAccessSerializer(serializers.ModelSerializer):

    class Meta:
        model = AppointmentAccess
        fields = ["id", "support_link", "can_add_questions", "can_record_answers", "granted_at", "revoked_at"]