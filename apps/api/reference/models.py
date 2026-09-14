from django.db import models
from mpowered_api.base_models import BaseModel
from django.core.validators import MaxValueValidator, MinValueValidator

# naming conventions for multiselect (for admin's reference):
# each line must have 2 tabs at the start, comma at the end, and be of the format:
#       CONSTANT = "display text",
# CONSTANT: must only contain all-caps letters and underscores.
# display text: what is inside the gets displayed on the app.

class PainType(BaseModel):
    class type(models.TextChoices): 
        ARTHRITIS = "Arthritis", 
        ANKYLOSING_SPONDYLITIS = "Ankylosing spondylitis",
        BACK_PAIN = "Back pain",
        BAKERS_CYST = "Baker's cyst",
        BURSITIS = "Bursitis",
        FOOT_RELATED_CONDITIONS = "Foot related conditions",
        FIBROMYALGIA = "Fibromyalgia",
        GOUT = "Gout",
        JUVENILE_IDIOPATHIC_ARTHRITIS = "Juvenile idiopathic arthritis",
        HAND_CONDITIONS = "Hand conditions",
        LUPUS = "Lupus",
        NECK_PAIN = "Neck pain",
        OSTEOARTHRITIS = "Osteoarthritis",
        Osteoporosis = "Osteoporosis",
        PAGETS_DISEASE = "Paget’s disease",
        PERTHES_DISEASE= "Perthes’ disease",
        POLYMYALGIA_RHEUMATICA = "Polymyalgia rheumatica",
        PSORIATIC_ARTHRITIS = "Psoriatic arthritis",
        RAYNAUDS_PHENOMENON = "Raynaud’s phenomenon",
        REACTIVE_ARTHRITIS = "Reactive arthritis",
        RHEUMATOID_ARTHRITIS = "Rheumatoid arthritis",
        SCLERODERMA = "Scleroderma",
        SHOULDER_PAIN = "Shoulder pain",
        SJROGENS_DISEASE = "Sjogren’s disease",
    type = models.CharField(default = type.ARTHRITIS, max_length = 50, choices = type.choices)

    class Meta: db_table = "pain_type"

class PainCharacteristic(BaseModel):
    class characteristic(models.TextChoices):
        ACHING = "Aching",
        THROBBING = "Throbbing",
        SHOOTING = "Shooting",
        STABBING = "Stabbing",
        GNAWING = "Gnawing",
        SHARP = "Sharp",
        TENDER = "Tender", 
        BURNING = "Burning",
        EXHAUSTING = "Exhausting",
        TIRING = "Tiring",
        PENETRATING = "Penetrating",
        NAGGING = "Nagging",
        NUMB = "Numb",
        MISERABLE = "Miserable",
        UNBEARABLE = "Unbearable",
    characteristic = models.CharField(default = characteristic.ACHING, max_length = 50, choices = 
                                      characteristic.choices)

    class Meta: db_table = "pain_characteristic"

class PainLocation(BaseModel):
    class location(models.TextChoices):
        HEAD = "Head",
        NECK = "Neck",
        SHOULDER = "Shoulder",
        UPPER_BACK = "Upper Back",
        LOWER_BACK = "Lower Back",
        LEG = "Leg",
        HIP = "Hip",
        BUTTOCK = "Buttock",
        KNEE = "Knee",
        OTHER = "Other",
    location = models.CharField(default = location.HEAD, max_length = 50, choices = location.choices)

    class Meta: db_table = "pain_location"

# class MultiSelect

class AssessmentStatement(BaseModel):
    class AppSection(models.TextChoices):
        MY_PAIN = "my_pain", 
        MY_MOVE = "my_movement", 
        MY_SOC_HEALTH = "my_social_health", 
        MY_PERS_CARE = "my_personal_care", 
        MY_MANAGE = "my_management"
    app_section = models.CharField(default = AppSection.MY_PAIN, max_length = 30, choices = AppSection.choices)

    question_number = models.PositiveSmallIntegerField(default=0, validators = [MinValueValidator(0), MaxValueValidator(20)]) 
    statement_number = models.PositiveSmallIntegerField(default=0)
    statement_text = models.CharField(max_length = 100)
    score = models.PositiveSmallIntegerField(default=0, validators = [MinValueValidator(0), MaxValueValidator(5)]) 

    class Meta: db_table = "assessment_statement"