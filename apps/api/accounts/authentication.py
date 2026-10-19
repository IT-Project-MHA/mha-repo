from rest_framework.authentication import TokenAuthentication

from accounts.models import DeviceToken


class DeviceTokenAuthentication(TokenAuthentication):
    model = DeviceToken