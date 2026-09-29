from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from accounts import otp
from apps.api.accounts.schemas import RequestCodeSchema, VerifyCodeSchema
from apps.api.accounts.rate_limits import PhoneBurstThrottle, PhoneSustainedThrottle


class RequestCodeView(APIView):
    # POST /auth/request-code - send otp to phone number

    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [ScopedRateThrottle, PhoneBurstThrottle, PhoneSustainedThrottle]
    throttle_scope = "otp_request"

    def post(self, request):
        serializer = RequestCodeSchema(data = request.data)
        serializer.is_valid(raise_exception = True)
        otp.issue_code(serializer.validated_data["phone_number"])

        # Same reply for every number so this can't be used to probe who has an account
        return Response({"detail": "Code sent."}, status = status.HTTP_202_ACCEPTED)


class VerifyCodeView(APIView):
    # POST /auth/verify-code - exchange a correct code for a verification_id

    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "otp_verify"

    def post(self, request):
        serializer = VerifyCodeSchema(data = request.data)
        serializer.is_valid(raise_exception = True)
        try:
            verification = otp.verify_code(**serializer.validated_data)
        except otp.VerificationError as error:
            body = {"detail": error.reason}
            if error.attempts_remaining is not None:
                body["attempts_remaining"] = error.attempts_remaining
            return Response(body, status = status.HTTP_400_BAD_REQUEST)
        # register / login / reset-pin (B4, B5, B8) take this id as proof the phone was verified
        return Response({"verification_id": verification.id}, status = status.HTTP_200_OK)