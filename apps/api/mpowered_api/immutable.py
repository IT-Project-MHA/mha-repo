from rest_framework import serializers

# helper function: saves serializer, but raises 400 if any of the given fields were changed.
# This is used when a field is not read_only, otherwise it would be listed as such in the 
# serializer.
def save_without_immutable_changes(serializer, immutable_fields):
    instance = serializer.instance
    errors = {}
    for field in immutable_fields:
        if field in serializer.validated_data:
            if serializer.validated_data[field] != getattr(instance, field):
                errors[field] = 'This field cannot be changed.'
    if errors:
        raise serializers.ValidationError(errors)
    serializer.save()
