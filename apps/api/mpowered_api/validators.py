import re
from datetime import datetime, time, timedelta
from zoneinfo import ZoneInfo
from django.utils import timezone
from rest_framework import serializers

# Shared value checks for serializers. Call them from a serializer's validate_<field> method.
# The app is only used in Australia.

# Australian timezone furthest ahead (eastern states), so no Australian user is ahead of it
AUSTRALIA_TIMEZONE = ZoneInfo('Australia/Sydney')

# Australian phone numbers in international format: +61 followed by a 9 digit number starting
# with 2, 3, 7, 8 (landlines) or 4 (mobiles), e.g. +61412345678
PHONE_NUMBER_PATTERN = re.compile(r'^\+61[23478]\d{8}$')

# helper function: returns the current date in Australia
def current_date():
    return timezone.now().astimezone(AUSTRALIA_TIMEZONE).date()

# helper function: returns the start & end of a date in Australia,
# for filtering timestamps by date
def australian_day_range(day):
    start = datetime.combine(day, time.min, tzinfo = AUSTRALIA_TIMEZONE)
    return start, start + timedelta(days = 1)

# helper function: returns the Monday of the current week in Australia
def current_week_starting():
    today = current_date()
    return today - timedelta(days = today.weekday())

# timestamp cannot be in the future
def validate_not_future(value):
    if value is not None and value > timezone.now():
        raise serializers.ValidationError('Cannot be in the future.')
    return value

# date cannot be in the past
def validate_not_past(value):
    if isinstance(value, datetime):
        day = value.astimezone(AUSTRALIA_TIMEZONE).date()
    else:
        day = value
    if day is not None and day < current_date():
        raise serializers.ValidationError('Cannot be in the past.')
    return value

# phone number must be Australian, without spaces or dashes. is converted to international format
def validate_phone_number(value):
    if not value:
        return value

    phone_number = value

    # Local format (0412345678) -> international (+61412345678)
    if re.fullmatch(r'0[0-9]{9}', phone_number):
        phone_number = '+61' + phone_number[1:]

    # Must now be +61 followed by 9 digits
    if not re.fullmatch(r'\+61[0-9]{9}', phone_number):
        raise serializers.ValidationError(
            'Phone number must be an Australian number, e.g. 0412345678 or +61412345678.')

    return phone_number

# helper function: returns attribute value from request data, or from the existing record for
# partial updates where the attribute wasn't given
def current_value(serializer, data, attribute):
    if attribute in data:
        return data[attribute]
    return getattr(serializer.instance, attribute, None)