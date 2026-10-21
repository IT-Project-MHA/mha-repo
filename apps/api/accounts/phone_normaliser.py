import re


def normalise_phone_number(value):

    digits = re.sub(r"\D", "", str(value))

    if digits.startswith("04") and len(digits) == 10:
        return "+61" + digits[1:]

    if digits.startswith("614") and len(digits) == 11:
        return "+" + digits

    return None