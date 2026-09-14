from django.db import models
from accounts.models import PatientProfile, User
from django.core.validators import MaxValueValidator, MinValueValidator
from mpowered_api.base_models import BaseModel

# Prescriptions and Weekly Assessments

class Prescription(BaseModel):
    patient_profile = models.ForeignKey(PatientProfile, on_delete = models.CASCADE, related_name = "patient")
    name = models.CharField(max_length = 50)
    dosage = models.PositiveSmallIntegerField()

    strength = models.PositiveIntegerField(default=0)
    started_on = models.DateField(null = True, blank = True)
    stopped_on = models.DateField(null = True, blank = True)
    notes = models.TextField(blank = True)
    class StrengthUnit(models.TextChoices):
        MG = "mg", "mg"
        G = "g", "g"
        PERCENT = "%", "%"
        MICRO_G = "μg", "μg"
        IU = "iu", "IU"
    strength_unit = models.CharField(default = StrengthUnit.MG, max_length = 10, choices = StrengthUnit.choices)

    class FormUnit(models.TextChoices):
        TAB = "tablets", "Tablets"
        CAP = "capsules", "Capsules"
        LIQ = "liquid", "Liquid"
        DROP = "drops", "Drops"
        INJ = "injections", "Injections"
        SPR = "spray", "Spray"
        ML = "mL", "mL"
        PAT = "patches", "Patches"
    form = models.CharField(default = FormUnit.TAB, max_length = 10, choices = FormUnit.choices)

    frequency = models.PositiveSmallIntegerField()
    class FrequencyUnit(models.TextChoices):
        H = "hour(s)", "Hour(s)"
        D = "day(s)", "Day(s)"
        W = "week(s)", "Week(s)"
        M = "month(s)", "Month(s)"
    frequency_unit = models.CharField(default = FrequencyUnit.H, max_length = 10, choices = FrequencyUnit.choices)

    class Meta:
        db_table = "prescription"
        ordering = ["name"]


class Assessment(BaseModel):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        SUBMITTED = "submitted", "Submitted"
        EXPIRED = "expired", "Expired"

    patient_profile = models.ForeignKey(PatientProfile, on_delete = models.CASCADE, related_name = "patient")
    date = models.DateField(auto_now_add = True)
    reflection = models.CharField(null = True, blank = True, max_length = 300)
    week_starting = models.DateField()
    status = models.CharField()

    class Meta:
        db_table = "assessment"
        ordering = ["-week_starting"]
        indexes = [
            # Search by date
            models.Index(fields = ["date"], name = "assessment_by_date_idx"),
        ]


class MyPain(BaseModel):
    assessment_id = models.OneToOneField(Assessment, on_delete = models.CASCADE, related_name = "assessment")
    current = models.PositiveSmallIntegerField(default=0, validators = [MinValueValidator(0), MaxValueValidator(10)])
    worst = models.PositiveSmallIntegerField(default=0, validators = [MinValueValidator(0), MaxValueValidator(10)])
    average = models.PositiveSmallIntegerField(default=0, validators = [MinValueValidator(0), MaxValueValidator(10)])
    mildest = models.PositiveSmallIntegerField(default=0, validators = [MinValueValidator(0), MaxValueValidator(10)])

    locations = models.ManyToManyField("reference.PainLocation", blank = True, related_name = "pain_entries")
    characteristics = models.ManyToManyField("reference.PainCharacteristic", blank = True, related_name = "pain_entries")

    other_location = models.CharField(null = True, blank = True, max_length = 300)
    other_characteristic = models.CharField(null = True, blank = True)

    class Meta:
        db_table = "my_pain"

class MySocialHealth(BaseModel):
    assessment_id = models.OneToOneField(Assessment, on_delete = models.CASCADE, related_name = "assessment")
    social_life = models.PositiveSmallIntegerField(default=0, validators = [MinValueValidator(0), MaxValueValidator(5)])    
    travelling = models.PositiveSmallIntegerField(default=0, validators = [MinValueValidator(0), MaxValueValidator(5)]) 
    mood = models.PositiveSmallIntegerField(default=0, validators = [MinValueValidator(0), MaxValueValidator(10)])    
    relationships = models.PositiveSmallIntegerField(default=0, validators = [MinValueValidator(0), MaxValueValidator(10)])    
    enjoyment_of_life = models.PositiveSmallIntegerField(default=0, validators = [MinValueValidator(0), MaxValueValidator(10)])    
    overall_mood = models.PositiveSmallIntegerField(default=1, validators = [MinValueValidator(1), MaxValueValidator(5)])
    reflection = models.CharField(null = True, blank = True, max_length = 300)
    score = models.PositiveSmallIntegerField(default=0, validators = [MinValueValidator(0), MaxValueValidator(20)]) 

    class Meta: db_table = "my_social_health"

class MyMovement(BaseModel):
    assessment_id = models.OneToOneField(Assessment, on_delete = models.CASCADE, related_name = "assessment")
    activeHours = models.PositiveSmallIntegerField(default=0, validators = [MinValueValidator(0), MaxValueValidator(168)])
    walking = models.PositiveSmallIntegerField(default=0, validators = [MinValueValidator(0), MaxValueValidator(5)])
    sitting = models.PositiveSmallIntegerField(default=0, validators = [MinValueValidator(0), MaxValueValidator(5)])
    lifting = models.PositiveSmallIntegerField(default=0, validators = [MinValueValidator(0), MaxValueValidator(5)])
    standing = models.PositiveSmallIntegerField(default=0, validators = [MinValueValidator(0), MaxValueValidator(5)])
    reflection = models.CharField(null = True, blank = True, max_length = 300)
    score = models.PositiveSmallIntegerField(default=0, validators = [MinValueValidator(0), MaxValueValidator(20)])

    class Meta: db_table = "my_movement"

class MyPersonalCare(BaseModel):
    assessment_id = models.OneToOneField(Assessment, on_delete = models.CASCADE, related_name = "assessment")
    personal_care = models.PositiveSmallIntegerField(default=0, validators = [MinValueValidator(0), MaxValueValidator(5)])
    sleeping = models.PositiveSmallIntegerField(default=0, validators = [MinValueValidator(0), MaxValueValidator(5)])
    reflection = models.CharField(null = True, blank = True, max_length = 300)
    score = models.PositiveSmallIntegerField(default=0, validators = [MinValueValidator(0), MaxValueValidator(20)])

    class Meta: db_table = "my_personal_care"

class MyManagement(BaseModel):
    assessment_id = models.OneToOneField(Assessment, on_delete = models.CASCADE, related_name = "assessment")
    medication = models.ManyToManyField(Prescription, blank = True, null = True, related_name = "prescriptions")
    otc_medication = models.CharField(null = True, blank = True, max_length = 300)
    exercise = models.PositiveSmallIntegerField(default=0, validators = [MinValueValidator(0), MaxValueValidator(5)])
    emotion = models.CharField(null = True, blank = True, max_length = 300)
    score = models.PositiveSmallIntegerField(default=0, validators = [MinValueValidator(0), MaxValueValidator(20)])

    class Meta: db_table = "my_management"

class GeneratedDocument(BaseModel):
    class DocumentType(models.TextChoices):
        PAIN_CHART = "pain_chart", "Pain Chart"
        PAIN_PROFILE = "pain_profile", "Pain Profile"
        APPOINTMENT = "appointment", "Appointment Summary"

    patient_profile = models.ForeignKey("accounts.PatientProfile", on_delete = models.PROTECT, related_name = "documents")
    generated_by = models.ForeignKey("accounts.User", on_delete = models.PROTECT, related_name = "+")
    type = models.CharField(max_length = 20, choices = DocumentType.choices)
    document_file = models.FileField(upload_to = "documents/%Y/%m/", null = True, blank = True)
    date_from = models.DateField(null = True, blank = True)
    date_until = models.DateField(null = True, blank = True)
    generated_at = models.DateTimeField(auto_now_add = True)

    class Meta:
        db_table = "generated_document"
        ordering = ["-generated_at"]
        indexes = [models.Index(fields = ["patient_profile", "-generated_at"], name = "document_by_patient_idx")]
