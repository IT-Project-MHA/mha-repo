from rest_framework.response import Response

from audit.services import record_view


class RecordView:
    # Add a VIEW entry when someone opens another persons record
    # Patient opening own data is not recorded

    def audit_target(self, instance):
        return instance

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        record_view(request.user, self.audit_target(instance))
        return Response(self.get_serializer(instance).data)