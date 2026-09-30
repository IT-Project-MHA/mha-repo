from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from accounts import otp, registration
from accounts.schemas import RequestCodeSchema, VerifyCodeSchema, RegisterSchema
from accounts.rate_limits import PhoneBurstThrottle, PhoneSustainedThrottle


class RequestCodeController(APIView):
    # POST /auth/request-code - send otp to phone number

    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [ScopedRateThrottle, PhoneBurstThrottle, PhoneSustainedThrottle]
    throttle_scope = "otp_request"

    def post(self, request):
        serializer = RequestCodeSchema(data = request.data)
        serializer.is_valid(raise_exception = True)
        otp.issue_otp(serializer.validated_data["phone_number"])

        # Same reply for every number so it cannot be used to probe who has an account
        return Response({"detail": "Code sent."}, status = status.HTTP_202_ACCEPTED)


class VerifyCodeController(APIView):
    # POST /auth/verify-code
    # Exchange a correct code for a verification_id

    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "otp_verify"

    def post(self, request):
        serializer = VerifyCodeSchema(data = request.data)
        serializer.is_valid(raise_exception = True)
        try:
            verification = otp.verify_otp(**serializer.validated_data)
        except otp.VerificationError as error:
            body = {"detail": error.reason}

            if error.attempts_remaining is not None:
                body["attempts_remaining"] = error.attempts_remaining

            return Response(body, status = status.HTTP_400_BAD_REQUEST)
        # register / login / reset-pin (B4, B5, B8) take this id as proof the phone was verified
        return Response({"verification_id": verification.id}, status = status.HTTP_200_OK)

class RegisterController(APIView):
    # POST /auth/register
    # Create an account once the phone is verified

    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "register"

    def post(self, request):
        serializer = RegisterSchema(data = request.data)
        serializer.is_valid(raise_exception = True)
        data = serializer.validated_data

        try:
            user, token = registration.register_user(
                verification_id = data["verification_id"],
                phone_number = data["phone_number"],
                display_name = data["display_name"],
                pin = data["pin"],
                track_health = data["track_health"],
                health = data.get("health"),
            )
        except registration.RegistrationError as error:
            # Phone already has an account so 409
            # Anything else 400
            if error.reason == "phone_taken":
                code = status.HTTP_409_CONFLICT
            else: 
                code = status.HTTP_400_BAD_REQUEST

            return Response({"detail": error.reason}, status = code)

        return Response(
            {"token": token.key, "user_id": user.id, "has_patient_profile": data["track_health"]},
            status = status.HTTP_201_CREATED,
        )