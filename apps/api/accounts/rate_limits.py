from rest_framework.throttling import SimpleRateThrottle

from accounts.phone_normaliser import normalise_phone_number

class PhoneRateThrottle(SimpleRateThrottle):
    # Throttle on the phone number
    
    def get_cache_key(self, request, view):
        data = request.data if hasattr(request.data, "get") else {}
        phone_number = normalise_phone_number(data.get("phone_number", ""))

        if not phone_number:
            return None
        
        return self.cache_format % {"scope": self.scope, "ident": phone_number}


class PhoneBurstThrottle(PhoneRateThrottle):
    scope = "otp_phone_burst"


class PhoneSustainedThrottle(PhoneRateThrottle):
    scope = "otp_phone_sustained"

class PhoneLoginThrottle(PhoneRateThrottle):
    scope = "login_phone"

