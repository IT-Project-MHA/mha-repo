from django.db.models import Q
from django.utils import timezone
from rest_framework import generics, serializers, status
from rest_framework.permissions import AllowAny, IsAuthenticated, SAFE_METHODS
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView


from mpowered_api.immutable import save_without_immutable_changes
from mpowered_api.protected import destroy_or_reject_protected
from mpowered_api.soft_delete import soft_delete


from accounts import devices, login, otp, registration, reset_pin
from accounts.models import PatientProfile, SupportLink, TermsAndPrivacy, TrustedDevice, User, UserSettings, PushToken
from accounts.rate_limits import PhoneBurstThrottle, PhoneLoginThrottle, PhoneSustainedThrottle
from accounts.permissions import visible_support_links, visible_patient_profiles
from accounts.delete import delete_account
from accounts.invite import *

from accounts.serializer import DeviceListSerializer, LoginSerializer, PatientProfileSerializer, RegisterSerializer, \
    RequestCodeSerializer, ResetPinSerializer, SupportLinkSerializer, TermsAndPrivacySerializer, \
    TrustedDeviceSerializer, UserSerializer, UserSettingsSerializer, VerifyCodeSerializer, ChangePhoneSerializer, PushTokenSerializer

from audit.models import AuditEntry
from audit.services import record

LOGIN_ERROR_STATUS = {
    "invalid_credentials": status.HTTP_401_UNAUTHORIZED,
    "verification_required": status.HTTP_403_FORBIDDEN,
    "verification_invalid": status.HTTP_400_BAD_REQUEST
}

SUPPORTER_STATUS_CHANGES = {
    SupportLink.Status.INVITED: [SupportLink.Status.ACTIVE, SupportLink.Status.REVOKED],
    SupportLink.Status.ACTIVE: [SupportLink.Status.REVOKED],
    SupportLink.Status.REVOKED: []
}


# Instructions:
# All views except sign up, log in, request code, verify code and reset pin 
# need the header Authorization: Token <token> from /auth/register or /auth/login.
# Without they return 401.

# Can only see records where patient_profile is user's own, or who user supports.

# To filter by attribute, put in the URL ?attribute_name=value. For multiple attributes:
# ?attribute_name1=value&attribute_name2=value...

# Attributes that are read only are specified in it's serializer. They are ignored if sent
# in an update request except the ones listed in save_without_immutable_changes which return 400.

# Records that other records depend on cannot be deleted; deleting them returns a 409 error.

# Who can insert/update/delete is specified in the comments. Records the user can see but is not
# allowed to update/delete return a 404 error for those requests.

# Auth instructions:
# Sign up: request-code, then verify-code (gives verification_id), then register (gives token).
# Log in: login with phone number, PIN and device_id. If it returns 403 verification_required,
#       it's a new device, so do request-code and verify-code then login again with the verification_id.
# Forgot PIN: request-code, verify-code, then reset-pin.
# Logout: reset-pin and revoking a device all sign out every device.

class RequestCodeView(APIView):
    # POST /auth/request-code - send otp to phone number

    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [ScopedRateThrottle, PhoneBurstThrottle, PhoneSustainedThrottle]
    throttle_scope = "otp_request"

    def post(self, request):
        serializer = RequestCodeSerializer(data = request.data)
        serializer.is_valid(raise_exception = True)
        otp.issue_otp(serializer.validated_data["phone_number"])

        # Same reply for every number so it cannot be used to probe who has an account
        return Response({"detail": "Code sent."}, status = status.HTTP_202_ACCEPTED)


class VerifyCodeView(APIView):
    # POST /auth/verify-code
    # Exchange a correct code for a verification_id

    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "otp_verify"

    def post(self, request):
        serializer = VerifyCodeSerializer(data = request.data)
        serializer.is_valid(raise_exception = True)
        try:
            verification = otp.verify_otp(**serializer.validated_data)
        except otp.VerificationError as error:
            body = {"detail": error.reason}

            if error.attempts_remaining is not None:
                body["attempts_remaining"] = error.attempts_remaining

            return Response(body, status = status.HTTP_400_BAD_REQUEST)
        
        return Response({"verification_id": verification.id}, status = status.HTTP_200_OK)


class RegisterView(APIView):
    # POST /auth/register
    # Create an account once the phone is verified

    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "register"

    def post(self, request):
        serializer = RegisterSerializer(data = request.data)
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
                device_id = data["device_id"]
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


class LoginView(APIView):
    # POST /auth/login
    # Phone number, pin and verification_id if it's a new device

    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [ScopedRateThrottle, PhoneLoginThrottle]
    throttle_scope = "login"

    def post(self, request):
        serializer = LoginSerializer(data = request.data)
        serializer.is_valid(raise_exception = True)
        data = serializer.validated_data

        try:
            user, token = login.login_user(
                phone_number = data["phone_number"],
                pin = data["pin"],
                device_id = data["device_id"],
                verification_id = data.get("verification_id")
            )
        except login.LoginError as error:
            return Response({"detail": error.reason}, status = LOGIN_ERROR_STATUS[error.reason])

        has_patient_profile = PatientProfile.objects.filter(user = user, deleted_at__isnull = True).exists()

        return Response(
            {"token": token.key, "user_id": user.id, "has_patient_profile": has_patient_profile},
            status = status.HTTP_200_OK,
        )

class LogoutView(APIView):
    # POST /auth/logout
    # Deletes token so all devices signed out

    permission_classes = [IsAuthenticated]

    def post(self, request):
        login.logout_user(request.user)

        return Response(status = status.HTTP_204_NO_CONTENT)

class DeviceListView(APIView):
    # GET /auth/devices
    # Devices user is signed in on
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = DeviceListSerializer(devices.list_devices(request.user), many = True)
        return Response(serializer.data, status = status.HTTP_200_OK)


class RevokeDeviceView(APIView):
    # POST /auth/devices/{id}/revoke
    # Revoke a device so it needs an otp again, also signs out everywhere
    permission_classes = [IsAuthenticated]

    def post(self, request, device_pk):
        # 404 for someone else's device so ids can't be probed
        if not devices.revoke_device(request.user, device_pk):
            return Response({"detail": "not_found"}, status = status.HTTP_404_NOT_FOUND)

        return Response(status = status.HTTP_204_NO_CONTENT)

class ResetPinView(APIView):
    # POST /auth/reset-pin

    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "reset_pin"

    def post(self, request):
        serializer = ResetPinSerializer(data = request.data)
        serializer.is_valid(raise_exception = True)

        data = serializer.validated_data

        try:
            user, token = reset_pin.reset_pin(
                phone_number = data["phone_number"],
                verification_id = data["verification_id"],
                pin = data["pin"],
                device_id = data["device_id"]
            )
        except reset_pin.PinResetError as error:
            return Response({"detail": error.reason}, status = status.HTTP_400_BAD_REQUEST)

        return Response({"token": token.key, "user_id": user.id}, status = status.HTTP_200_OK)


# User APIs:
class UserList(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_queryset(self):
        user = self.request.user
        return User.objects.filter(id = user.id)

class UserRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_queryset(self):
        user = self.request.user
        return User.objects.filter(id = user.id)

    # Soft deletion
    def perform_destroy(self, instance):
        delete_account(instance)



# PatientProfile APIs:

class PatientProfileListCreate(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PatientProfileSerializer

    def get_queryset(self):
        user = self.request.user
        query_user = self.request.query_params.get("user")
        query_set = visible_patient_profiles(user)
        if query_user:
            query_set = query_set.filter(user = query_user)
        return query_set.distinct()

    # can only create one's own patient profile, and only 1 PatientProfile
    def perform_create(self, serializer):
        user = self.request.user
        existing = PatientProfile.objects.filter(user = user).first()

        if existing is not None and existing.deleted_at is None:
            raise serializers.ValidationError(
                {'user':'A patient profile already exists for this user.'})

        # If existing account grab old profile abd history
        if existing is not None:
            serializer.instance = existing
            serializer.save(deleted_at = None)
        else:
            serializer.save(user = user)
        record(user, AuditEntry.Action.CREATE, serializer.instance)

class PatientProfileRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PatientProfileSerializer

    def get_queryset(self):
        user = self.request.user
        query_set = visible_patient_profiles(user)

        # user can only edit their own patient_profile
        if self.request.method not in SAFE_METHODS:
            query_set = query_set.filter(user = user)
        return query_set.distinct()

    def perform_update(self, serializer):
        serializer.save()
        record(self.request.user, AuditEntry.Action.UPDATE, serializer.instance)

    def perform_destroy(self, instance):
        soft_delete(instance)
        record(self.request.user, AuditEntry.Action.DELETE, instance)

class ChangePhoneView(APIView):
    # POST /auth/change-phone

    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "register"

    def post(self, request):
        serializer = ChangePhoneSerializer(data = request.data)
        serializer.is_valid(raise_exception = True)

        try:
            registration.change_phone(request.user, **serializer.validated_data)
        except registration.RegistrationError as error:
            if error.reason == "phone_taken":
                code = status.HTTP_409_CONFLICT
            else:
                code = status.HTTP_400_BAD_REQUEST

            return Response({"detail": error.reason}, status = code)

        return Response({"phone_number": request.user.phone_number}, status = status.HTTP_200_OK)

# UserSettings APIs:
class UserSettingsListCreate(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSettingsSerializer

    def get_queryset(self):
        user = self.request.user
        return UserSettings.objects.filter(user = user)

    def perform_create(self, serializer):
        user = self.request.user
        # user can only have 1 UserSettings
        if UserSettings.objects.filter(user = user).exists():
            raise serializers.ValidationError(
                {'user':'User settings already exist for this user.'})
        serializer.save(user = user)

class UserSettingsRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSettingsSerializer

    def get_queryset(self):
        user = self.request.user
        return UserSettings.objects.filter(user = user)



# SupportLink APIs:

# helper function: returns user's own patient profile, or raises 400 error if user doesn't have one
def own_patient_profile(user):
    patient_profile = PatientProfile.objects.filter(user = user, deleted_at__isnull = True).first()
    if not patient_profile:
        raise serializers.ValidationError(
            {'patient_profile':'User does not have a patient profile.'})
    return patient_profile

class SupportLinkListCreate(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SupportLinkSerializer

    def get_queryset(self):
        user = self.request.user
        # can filter by patient_profile and status
        query_patient_profile = self.request.query_params.get("patient_profile")
        query_status = self.request.query_params.get("status")
        query_set = visible_support_links(user)
        if query_patient_profile:
            query_set = query_set.filter(patient_profile = query_patient_profile)
        if query_status:
            query_set = query_set.filter(status = query_status)
        return query_set.distinct()

    def perform_create(self, serializer):
        user = self.request.user
        data = serializer.validated_data
        try:
            serializer.instance = invite_supporter(user, own_patient_profile(user),
                                                           data.get('invited_phone_number'), data)
        except InviteError as error:
            raise serializers.ValidationError({'invited_phone_number': error.reason})

class SupportLinkRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SupportLinkSerializer

    def get_queryset(self):
        user = self.request.user
        query_patient_profile = self.request.query_params.get("patient_profile")
        query_status = self.request.query_params.get("status")
        query_set = visible_support_links(user)

        # user can only delete support link if they are the patient
        if self.request.method == 'DELETE':
            query_set = query_set.filter(patient_user = user)
        if query_patient_profile:
            query_set = query_set.filter(patient_profile = query_patient_profile)
        if query_status:
            query_set = query_set.filter(status = query_status)
        return query_set.distinct()

    def perform_update(self, serializer):
        user = self.request.user
        link = serializer.instance
        new_status = serializer.validated_data.get('status', link.status)

        # what this user is allowed to change
        if link.patient_user_id == user.id:
            # patient can edit switches or remove supporters
            allowed_fields = ['status'] + PERMISSIONS
            allowed_statuses = [link.status, SupportLink.Status.REVOKED]
        else:
            # supporter can only accept an invite or leave
            allowed_fields = ['status']
            allowed_statuses = [link.status] + SUPPORTER_STATUS_CHANGES[link.status]

        # Decline anything else
        for field, value in serializer.validated_data.items():
            if field not in allowed_fields and value != getattr(link, field):
                raise serializers.ValidationError({field: 'You cannot change this.'})

        if new_status not in allowed_statuses:
            raise serializers.ValidationError({'status': f'Cannot change status to {new_status}.'})

        # Save with date it was accepted or revoked
        if new_status == link.status:
            serializer.save()
        elif new_status == SupportLink.Status.ACTIVE:
            serializer.save(accepted_at = timezone.now())
        else:
            serializer.save(revoked_at = timezone.now())

        record(user, AuditEntry.Action.UPDATE, serializer.instance)

    # Deleting a link revokes it and the row stays for the audit history
    def perform_destroy(self, instance):
        if instance.status != SupportLink.Status.REVOKED:
            instance.status = SupportLink.Status.REVOKED
            instance.revoked_at = timezone.now()
            instance.save(update_fields = ['status', 'revoked_at', 'updated_at'])
            record(self.request.user, AuditEntry.Action.REVOKE, instance)


# TermsAndPrivacy APIs:
class TermsAndPrivacyListCreate(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TermsAndPrivacySerializer

    def get_queryset(self):
        user = self.request.user
        document_type = self.request.query_params.get("document_type")
        query_set = TermsAndPrivacy.objects.filter(user = user)
        if document_type:
            query_set = query_set.filter(document_type = document_type)
        return query_set

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(user = user)


class TermsAndPrivacyRetrieve(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TermsAndPrivacySerializer

    def get_queryset(self):
        user = self.request.user
        document_type = self.request.query_params.get("document_type")
        query_set = TermsAndPrivacy.objects.filter(user = user)
        if document_type:
            query_set = query_set.filter(document_type = document_type)
        return query_set


# TrustedDevice APIs:
class TrustedDeviceList(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TrustedDeviceSerializer

    def get_queryset(self):
        return TrustedDevice.objects.filter(user = self.request.user)

class TrustedDeviceRetrieve(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TrustedDeviceSerializer

    def get_queryset(self):
        return TrustedDevice.objects.filter(user = self.request.user)


class PushTokenView(APIView):
    # POST /auth/push-token
    # Save expo token

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PushTokenSerializer(data = request.data)
        serializer.is_valid(raise_exception = True)

        # A phone that signs into a different account moves its token to that account
        PushToken.objects.update_or_create(token = serializer.validated_data["token"],
                                           defaults = {"user": request.user})

        return Response(status = status.HTTP_204_NO_CONTENT)

