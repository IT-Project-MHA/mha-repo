import logging

import requests
from django.conf import settings

logger = logging.getLogger(__name__)


BASE_URL = "https://verify.twilio.com/v2/Services"
TIMEOUT = 10


class VerifyError(Exception):
    pass


def post(path, data):
    try:
        return requests.post(
            f"{BASE_URL}/{settings.TWILIO_VERIFY_SERVICE_SID}/{path}",
            auth = (settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN),
            data = data,
            timeout = TIMEOUT,
        )
    except requests.RequestException as error:
        logger.error("Twilio Verify request failed: %s", error)
        raise VerifyError("unreachable") from error


def start_verification(phone_number):
    response = post("Verifications", {"To": phone_number, "Channel": "sms"})

    if not response.ok:
        logger.error("Twilio Verify could not send a code, status %s", response.status_code)
        raise VerifyError("send_failed")


def check_verification(phone_number, code):
    response = post("VerificationCheck", {"To": phone_number, "Code": code})

    if response.status_code == 404:
        return "expired"

    if response.status_code == 429:
        return "locked"

    if not response.ok:
        logger.error("Twilio Verify could not check a code, status %s", response.status_code)
        raise VerifyError("check_failed")

    return "approved" if response.json().get("status") == "approved" else "invalid"
