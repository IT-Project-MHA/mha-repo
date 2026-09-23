from django.db import models
from accounts.models import PatientProfile, User
from django.core.validators import MaxValueValidator, MinValueValidator
from mpowered_api.base_models import BaseModel

# Prescriptions and Weekly Assessments

class Prescription(BaseModel): 
    patient_profile = models.ForeignKey(PatientProfile, on_delete = models.CASCADE, related_name = "perscriptions")
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
    form = models.CharField(default = FormUnit.TAB, max_length = 20, choices = FormUnit.choices)

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

    patient_profile = models.ForeignKey(PatientProfile, on_delete = models.CASCADE, related_name = "assessment_assessments")
    submitted_at = models.DateTimeField(null = True, blank = True)
    reflection = models.CharField(null = True, blank = True, max_length = 300)
    week_starting = models.DateField()
    status = models.CharField()

    class Meta:
        db_table = "assessment"
        ordering = ["-week_starting"]
        constraints = [
            # Per week uniqueness
            models.UniqueConstraint(fields = ["patient_profile", "week_starting"], name = "one_assessment_per_week"),
        ]
        indexes = [
            # Search by week
            models.Index(fields = ["week_starting"], name = "assessment_by_date_idx"),
        ]


class MyPain(BaseModel):
    assessment_id = models.OneToOneField(Assessment, on_delete = models.CASCADE, related_name = "my_pain")
    current = models.PositiveSmallIntegerField(null = True, blank = True, validators = [MinValueValidator(0), MaxValueValidator(10)])
    worst = models.PositiveSmallIntegerField(null = True, blank = True, validators = [MinValueValidator(0), MaxValueValidator(10)])
    average = models.PositiveSmallIntegerField(null = True, blank = True, validators = [MinValueValidator(0), MaxValueValidator(10)])
    mildest = models.PositiveSmallIntegerField(null = True, blank = True, validators = [MinValueValidator(0), MaxValueValidator(10)])

    locations = models.ManyToManyField("reference.QuestionOption", blank = True, related_name = "+", 
                                       limit_choices_to = {"question_key": "pain_location"})
    characteristics = models.ManyToManyField("reference.QuestionOption", blank = True, related_name = "+", 
                                             limit_choices_to = {"question_key": "pain_characteristic"})

    other_location = models.CharField(null = True, blank = True, max_length = 100)
    other_characteristic = models.CharField(null = True, blank = True, max_length = 100)
    completed_at = models.DateTimeField(null = True, blank = True)

    class Meta: db_table = "my_pain"


class MyMovement(BaseModel):
    assessment_id = models.OneToOneField(Assessment, on_delete = models.CASCADE, related_name = "my_movement")
    active_hours = models.PositiveSmallIntegerField(null = True, blank = True, validators = [MinValueValidator(0), MaxValueValidator(168)])
    general_impacts = models.ManyToManyField("reference.QuestionOptionOrdered", blank = True, related_name = "+",
                                             limit_choices_to = {"question_key": "movement_general_impacts"})
    walking = models.ForeignKey("reference.QuestionOptionOrdered", null = True, blank = True, on_delete = models.PROTECT,
                                related_name = "+", limit_choices_to = {"question_key": "movement_walking"})
    sitting = models.ForeignKey("reference.QuestionOptionOrdered", null = True, blank = True, on_delete = models.PROTECT,
                                related_name = "+", limit_choices_to = {"question_key": "movement_sitting"})
    lifting = models.ForeignKey("reference.QuestionOptionOrdered", null = True, blank = True, on_delete = models.PROTECT,
                                related_name = "+", limit_choices_to = {"question_key": "movement_lifting"})
    standing = models.ForeignKey("reference.QuestionOptionOrdered", null = True, blank = True, on_delete = models.PROTECT,
                                 related_name = "+", limit_choices_to = {"question_key": "movement_standing"})
    reflection = models.CharField(null = True, blank = True, max_length = 300)
    score = models.PositiveSmallIntegerField(null = True, blank = True, validators = [MinValueValidator(0), MaxValueValidator(26)])
    completed_at = models.DateTimeField(null = True, blank = True)   # per-section "last completed" (E2-1)

    class Meta: db_table = "my_movement"


class MyPersonalCare(BaseModel):
    assessment = models.OneToOneField(Assessment, on_delete = models.CASCADE, related_name = "my_personal_care")
    general_activities_impact = models.ManyToManyField("reference.QuestionOptionOrdered", blank = True, related_name = "+",
                                                       limit_choices_to = {"question_key": "care_general_impacts"})
    personal_care = models.ForeignKey("reference.QuestionOptionOrdered", null = True, blank = True, on_delete = models.PROTECT,
                                      related_name = "+", limit_choices_to = {"question_key": "care_personal_care"})
    sleeping = models.ForeignKey("reference.QuestionOptionOrdered", null = True, blank = True, on_delete = models.PROTECT,
                                 related_name = "+", limit_choices_to = {"question_key": "care_sleeping"})
    reflection = models.CharField(null = True, blank = True, max_length = 300)
    score = models.PositiveSmallIntegerField(null = True, blank = True, validators = [MinValueValidator(0), MaxValueValidator(15)])
    completed_at = models.DateTimeField(null = True, blank = True)

    class Meta: db_table = "my_personal_care"

class MySocialHealth(BaseModel):
    assessment = models.OneToOneField(Assessment, on_delete = models.CASCADE, related_name = "my_social_health")
    social_life = models.ForeignKey("reference.QuestionOptionOrdered", null = True, blank = True, on_delete = models.PROTECT,
                                    related_name = "+", limit_choices_to = {"question_key": "social_social_life"})
    travelling = models.ForeignKey("reference.QuestionOptionOrdered", null = True, blank = True, on_delete = models.PROTECT,
                                   related_name = "+", limit_choices_to = {"question_key": "social_travelling"})
    mood = models.PositiveSmallIntegerField(null = True, blank = True, validators = [MinValueValidator(0), MaxValueValidator(10)])
    relationships = models.PositiveSmallIntegerField(null = True, blank = True, validators = [MinValueValidator(0), MaxValueValidator(10)])
    enjoyment_of_life = models.PositiveSmallIntegerField(null = True, blank = True, validators = [MinValueValidator(0), MaxValueValidator(10)])
    overall_mood = models.ForeignKey("reference.QuestionOptionOrdered", null = True, blank = True, on_delete = models.PROTECT,
                                     related_name = "+", limit_choices_to = {"question_key": "social_overall_mood"})
    reflection = models.CharField(null = True, blank = True, max_length = 300)
    score = models.PositiveSmallIntegerField(null = True, blank = True, validators = [MinValueValidator(0), MaxValueValidator(40)])
    completed_at = models.DateTimeField(null = True, blank = True)

    class Meta: db_table = "my_social_health"

class MyManagement(BaseModel):
    assessment = models.OneToOneField(Assessment, on_delete = models.CASCADE, related_name = "my_management")
    medication = models.ManyToManyField(Prescription, blank = True, related_name = "my_management_prescriptions")
    otc_medication = models.CharField(null = True, blank = True, max_length = 300)
    exercise = models.ForeignKey("reference.QuestionOptionOrdered", null = True, blank = True, on_delete = models.PROTECT,
                                 related_name = "+", limit_choices_to = {"question_key": "management_exercise"})
    emotion = models.CharField(null = True, blank = True, max_length = 300)
    score = models.PositiveSmallIntegerField(null = True, blank = True, validators = [MinValueValidator(0), MaxValueValidator(20)])
    completed_at = models.DateTimeField(null = True, blank = True)

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
