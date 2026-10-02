from rest_framework import serializers

# helper function: saves serializer, but raises 400 if any of the given fields were changed.
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
