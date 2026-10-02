from rest_framework import serializers
from .models import AuditEntry
from mpowered_api.validators import validate_not_future

class AuditEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditEntry
        fields = '__all__'
        read_only_fields = ['audit_user']

    def validate_occurred_at(self, occurred_at):
        return validate_not_future(occurred_at)
