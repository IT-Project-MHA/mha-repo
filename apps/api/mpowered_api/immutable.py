from rest_framework import serializers

# helper function: rejects update if any immutable field's value is changed, otherwise saves.
# Call it from a view's perform_update.
def save_without_immutable_changes(serializer, immutable_fields):
    instance = serializer.instance
    errors = {}
    for field in immutable_fields:
        if field in serializer.validated_data and \
           serializer.validated_data[field] != getattr(instance, field):
            errors[field] = 'This field cannot be changed.'
    if errors:
        raise serializers.ValidationError(errors)
    serializer.save()
