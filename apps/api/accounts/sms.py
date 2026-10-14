from django.conf import settings


def send_sms(phone_number, message):
    if settings.DEBUG:
        print(f"[SMS] {phone_number}: {message}")