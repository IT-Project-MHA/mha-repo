from django.db.models import ProtectedError
from rest_framework import status
from rest_framework.exceptions import APIException

class ProtectedRecord(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = 'This record cannot be deleted because other records depend on it.'
    default_code = 'protected'

# helper function: deletes instance, or returns a 409 error if other records reference it through
# a PROTECT foreign key. Call it from a view's perform_destroy.
def destroy_or_reject_protected(instance):
    try:
        instance.delete()
    except ProtectedError:
        raise ProtectedRecord()
