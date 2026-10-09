from django.db.models import Q
from .models import AuditEntry
from .serializer import *

# instructions:
# All views are protected by authenticated user id (can only see records where patient_profile
# is user's own, or who user supports), for relevant tables.

# Attributes that can be filtered are specified in the comments. To filter by attribute, put 
# in the URL ?attribute_name=value. For multiple attributes: 
# ?attribute_name1=value&?attribute_name2=value...


def visible_audit_entries(user):
    return AuditEntry.objects.filter(Q(audit_user = user) | Q(patient_profile__user = user))

# AuditEntry APIs:
class AuditEntryList(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AuditEntrySerializer

    def get_queryset(self):
        return visible_audit_entries(self.request.user)

class AuditEntryRetrieve(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AuditEntrySerializer

    def get_queryset(self):
        return visible_audit_entries(self.request.user)