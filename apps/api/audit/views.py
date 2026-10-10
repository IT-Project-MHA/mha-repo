from django.db.models import Q
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import AuditEntry
from .serializer import *

# Instructions:
# All views need the header Authorization: Token <token>, without they return 401.

# Read only. Can only see entries the user made, or entries about the user's own records.

# To filter by attribute, put in the URL ?attribute_name=value. For multiple attributes:
# ?attribute_name1=value&attribute_name2=value...

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