from rest_framework import serializers

from accounts.otp import OTP_LENGTH


class RequestCodeSchema(serializers.Serializer):
    phone_number = serializers.CharField(max_length = 20)


class VerifyCodeSchema(RequestCodeSchema):
    otp = serializers.RegexField(rf"^\d{{{OTP_LENGTH}}}$")