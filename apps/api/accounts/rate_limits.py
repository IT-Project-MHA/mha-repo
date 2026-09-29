from rest_framework.throttling import SimpleRateThrottle


class PhoneRateThrottle(SimpleRateThrottle):
    # Throttle keyed on the phone number in the request body rather than the caller's IP

    def get_cache_key(self, request, view):
        data = request.data if hasattr(request.data, "get") else {}
        phone_number = str(data.get("phone_number", "")).strip()

        if not phone_number:
            return None
        
        return self.cache_format % {"scope": self.scope, "ident": phone_number}


class PhoneBurstThrottle(PhoneRateThrottle):
    scope = "otp_phone_burst"


class PhoneSustainedThrottle(PhoneRateThrottle):
    scope = "otp_phone_sustained"