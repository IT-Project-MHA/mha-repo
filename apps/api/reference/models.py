from django.db import models
from mpowered_api.base_models import BaseModel
from django.core.validators import MaxValueValidator, MinValueValidator

class AppSection(models.TextChoices):
    ONBOARDING = "onboarding",
    MY_PAIN = "my_pain", 
    MY_MOVE = "my_movement", 
    MY_SOC_HEALTH = "my_social_health", 
    MY_PERS_CARE = "my_personal_care", 
    MY_MANAGE = "my_management"

# plain question option

class QuestionOption(BaseModel):
    app_section = models.CharField(default = AppSection.MY_PAIN, max_length = 30, choices = AppSection.choices)
    text = models.CharField(max_length = 50)
    sort_order = models.PositiveSmallIntegerField(default = 0)
    is_active = models.BooleanField(default = True)
    class Meta: 
        db_table = "question_option"
        ordering = ["question_key", "sort_order"]
        constraints = [
            models.UniqueConstraint(fields = ["question_key", "text"], name = "unique_option_per_question"),
        ]

# multiselect/multiple choice question option with:
#       - order of appearance
#       - score value

class QuestionOptionOrdered(BaseModel):
    app_section = models.CharField(default = AppSection.MY_PAIN, max_length = 30, choices = AppSection.choices)
    text = models.CharField(max_length = 100)
    question_number = models.PositiveSmallIntegerField(default=0, validators = [MinValueValidator(0), MaxValueValidator(20)]) 
    option_number = models.PositiveSmallIntegerField(default=0)
    score = models.PositiveSmallIntegerField(default=0, validators = [MinValueValidator(0), MaxValueValidator(5)]) 
    class Meta: 
        db_table = "question_option_ordered"
        ordering = ["question_key", "option_number"]
        constraints = [
            models.UniqueConstraint(fields = ["question_key", "option_number"], name = "unique_option_number_per_question"),
        ]

# OTP
class PhoneVerification(BaseModel):
    phone_number = models.CharField(max_length = 20, db_index = True)
    code = models.CharField(max_length = 128)
    # Lock after three attempts
    attempts = models.PositiveSmallIntegerField(default = 0) 
    used_at = models.DateTimeField(null = True, blank = True)
    expires_at = models.DateTimeField()

    class Meta:
        db_table = "phone_verification"

class TrustedDevice(BaseModel):
    user = models.ForeignKey(User, on_delete = models.CASCADE, related_name = "trusted_devices")
    device_id = models.CharField(max_length = 128)
    label = models.CharField(max_length = 80, blank = True)
    last_seen_at = models.DateTimeField(auto_now = True)
    revoked_at = models.DateTimeField(null = True, blank = True)

    class Meta:
        db_table = "trusted_device"
        constraints = [models.UniqueConstraint(fields = ["user", "device_id"], name = "one_row_per_device")]