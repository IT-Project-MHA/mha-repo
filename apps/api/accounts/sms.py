import logging

import requests
from django.conf import settings

logger = logging.getLogger(__name__)


# Providers:
# Each one sends a text and raises requests.RequestException if it fails.
# To use another sms provider any add a function here, add it to PROVIDERS, then set SMS_PROVIDER to its name

def send_with_console(phone_number, message):
    print(f"[SMS] {phone_number}: {message}")


def send_with_twilio(phone_number, message):
    response = requests.post(
        f"https://api.twilio.com/2010-04-01/Accounts/{settings.TWILIO_ACCOUNT_SID}/Messages.json",
        auth = (settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN),
        data = {"To": phone_number, "From": settings.TWILIO_FROM_NUMBER, "Body": message},
        timeout = 10,
    )
    response.raise_for_status()


PROVIDERS = {
    "console": send_with_console,
    "twilio": send_with_twilio
}


def send_sms(phone_number, message):

    # Sends a text with whichever provider SMS_PROVIDER names

    provider = PROVIDERS.get(settings.SMS_PROVIDER)

    if provider is None or (provider is send_with_console and not settings.DEBUG):
        logger.error("SMS not sent, SMS_PROVIDER is not correct")
        return

    try:
        provider(phone_number, message)
    except requests.RequestException:
        logger.error("SMS could not be sent")