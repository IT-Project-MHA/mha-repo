import logging

from exponent_server_sdk import DeviceNotRegisteredError, PushClient, PushMessage, PushServerError
from requests.exceptions import ConnectionError, HTTPError

from accounts.models import PushToken

logger = logging.getLogger(__name__)


def send_push(users, title, body, data = None):

    # Send a notification to every phone users have registered and returns how many phones it was sent to

    push_tokens = list(PushToken.objects.filter(user__in = users))

    for push_token in push_tokens:
        try:
            message = PushMessage(to = push_token.token, title = title, body = body, data = data)
            PushClient().publish(message).validate_response()
        except DeviceNotRegisteredError:
            push_token.delete()
        except (PushServerError, ConnectionError, HTTPError):
            # Expo down or no internet the next run will try again
            logger.warning("Push notification could not be sent")

    return len(push_tokens)