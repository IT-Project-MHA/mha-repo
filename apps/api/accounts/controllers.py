from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from accounts import otp, registration, login, devices
from accounts.schemas import RequestCodeSchema, VerifyCodeSchema, RegisterSchema, LoginSchema, TrustedDeviceSchema
from accounts.rate_limits import PhoneBurstThrottle, PhoneSustainedThrottle, PhoneLoginThrottle, PhoneRateThrottle
from accounts.models import PatientProfile

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
                device_id = data["device_id"],
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

LOGIN_ERROR_STATUS = {
    "invalid_credentials": status.HTTP_401_UNAUTHORIZED,
    "verification_required": status.HTTP_403_FORBIDDEN,
    "verification_invalid": status.HTTP_400_BAD_REQUEST,
}


class LoginController(APIView):
    # POST /auth/login
    # Phone number, pin and verification_id if it's a new device

    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [ScopedRateThrottle, PhoneLoginThrottle]
    throttle_scope = "login"

    def post(self, request):
        serializer = LoginSchema(data = request.data)
        serializer.is_valid(raise_exception = True)
        data = serializer.validated_data

        try:
            user, token = login.login_user(
                phone_number = data["phone_number"],
                pin = data["pin"],
                device_id = data["device_id"],
                verification_id = data.get("verification_id"),
            )
        except login.LoginError as error:
            return Response({"detail": error.reason}, status = LOGIN_ERROR_STATUS[error.reason])

        has_patient_profile = PatientProfile.objects.filter(user = user, deleted_at__isnull = True).exists()

        return Response(
            {"token": token.key, "user_id": user.id, "has_patient_profile": has_patient_profile},
            status = status.HTTP_200_OK,
        )


class LogoutController(APIView):
    # POST /auth/logout
    # Deletes token so all devices signed out

    permission_classes = [IsAuthenticated]

    def post(self, request):
        login.logout_user(request.user)

        return Response(status = status.HTTP_204_NO_CONTENT)

class DeviceListController(APIView):
    # GET /auth/devices
    # Devices user is signed in on
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = TrustedDeviceSchema(devices.list_devices(request.user), many = True)
        return Response(serializer.data, status = status.HTTP_200_OK)


class RevokeDeviceController(APIView):
    # POST /auth/devices/{id}/revoke
    # Revoke a device so it needs an otp again, also signs out everywhere
    permission_classes = [IsAuthenticated]

    def post(self, request, device_pk):
        # 404 for someone else's device so ids can't be probed
        if not devices.revoke_device(request.user, device_pk):
            return Response({"detail": "not_found"}, status = status.HTTP_404_NOT_FOUND)

        return Response(status = status.HTTP_204_NO_CONTENT)
