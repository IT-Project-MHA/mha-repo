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
    class StrengthUnit(models.TextChoices): MG = "mg", G = "g", PERCENT = "%", MICRO_G = "μg", IU = "iu"
    strength_unit = models.CharField(default = StrengthUnit.MG, max_length = 10, choices = StrengthUnit.choices)

    class FormUnit(models.TextChoices): TAB = "tablets", CAP = "capsules", LIQ = "liquid", DROP = "drops", INJ = "injections",
    SPR = "spray", ML = "mL", PAT = "patches"
    form = models.CharField(default = FormUnit.TAB, max_length = 10, choices = FormUnit.choices)

    frequency = models.PositiveSmallIntegerField()
    class FrequencyUnit(models.TextChoices): H = "hour(s)", D = "day(s)", W = "week(s)", M = "month(s)"
    frequency_unit = models.CharField(default = FrequencyUnit.H, max_length = 10, choices = FrequencyUnit.choices)

    class Meta:
        db_table = "prescription"

class Assessment(BaseModel):
    patient_profile = models.ForeignKey(PatientProfile, on_delete = models.CASCADE, related_name = "patient")
    date = models.DateField(auto_now_add = True)
    reflection = models.CharField(null = True, blank = True, max_length = 300)

    class Meta:
        db_table = "assessment"
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
    otherLocation = models.CharField(null = True, blank = True, max_length = 300)

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

    class Meta:
        db_table = "my_social_health"

class MyMovement(BaseModel):
    assessment_id = models.OneToOneField(Assessment, on_delete = models.CASCADE, related_name = "assessment")
    activeHours = models.PositiveSmallIntegerField(default=0, validators = [MinValueValidator(0), MaxValueValidator(168)])
    walking = models.PositiveSmallIntegerField(default=0, validators = [MinValueValidator(0), MaxValueValidator(5)])
    sitting = models.PositiveSmallIntegerField(default=0, validators = [MinValueValidator(0), MaxValueValidator(5)])
    lifting = models.PositiveSmallIntegerField(default=0, validators = [MinValueValidator(0), MaxValueValidator(5)])
    standing = models.PositiveSmallIntegerField(default=0, validators = [MinValueValidator(0), MaxValueValidator(5)])
    reflection = models.CharField(null = True, blank = True, max_length = 300)
    score = models.PositiveSmallIntegerField(default=0, validators = [MinValueValidator(0), MaxValueValidator(20)])

    class Meta:
        db_table = "my_movement"

class MyPersonalCare(BaseModel):
    assessment_id = models.OneToOneField(Assessment, on_delete = models.CASCADE, related_name = "assessment")
    personal_care = models.PositiveSmallIntegerField(default=0, validators = [MinValueValidator(0), MaxValueValidator(5)])
    sleeping = models.PositiveSmallIntegerField(default=0, validators = [MinValueValidator(0), MaxValueValidator(5)])
    reflection = models.CharField(null = True, blank = True, max_length = 300)
    score = models.PositiveSmallIntegerField(default=0, validators = [MinValueValidator(0), MaxValueValidator(20)])

    class Meta:
        db_table = "my_personal_care"

class MyManagement(BaseModel):
    assessment_id = models.OneToOneField(Assessment, on_delete = models.CASCADE, related_name = "assessment")
    medication = models.ManyToManyField(Prescription, blank = True, null = True, related_name = "prescriptions")
    otc_medication = models.CharField(null = True, blank = True, max_length = 300)
    exercise = models.PositiveSmallIntegerField(default=0, validators = [MinValueValidator(0), MaxValueValidator(5)])
    emotion = models.CharField(null = True, blank = True, max_length = 300)
    score = models.PositiveSmallIntegerField(default=0, validators = [MinValueValidator(0), MaxValueValidator(20)])

    class Meta:
        db_table = "my_management"

# Appointments

class Appointment(BaseModel):
    patient_profile = models.ForeignKey(PatientProfile, on_delete = models.PROTECT, related_name = "patient")
    date = models.DateField()
    doctor = models.CharField(max_length = 100)
    recording_consent = models.BooleanField(default = False)
    doctor_signature = models.URLField(null= True, blank = True)

    class HealthService(models.TextChoices): GP = "General Practitioner", PHY = "Physiotherapist", RHE = "Rheumatologist", 
    OST = "Osteopath", PMS = "Pain Medicine Specialist", OS = "Orthopaedy surgeon", OT = "Occupational Therapist", OTHER = "Other"
    health_service = models.CharField(default = HealthService.GP, max_length = 50, choices = HealthService.choices)

    class Meta:
        db_table = "appointment"
        indexes = [
            # Search by date
            models.Index(fields = ["date"], name = "appointment_by_date_idx"),
            # Search by patient
            models.Index(fields = ["patient_profile"], name = "appointment_by_patient_idx"),
        ]
    
class Question(BaseModel):
    appointment = models.ForeignKey(Appointment, on_delete = models.CASCADE, related_name = "appointment")
    question = models.CharField(max_length = 200)
    answer_text = models.CharField(null = True, blank = True, max_length = 300)
    answer_recording = models.URLField(null= True, blank = True)

    class Meta:
        db_table = "question"

class SupportPermission(BaseModel):
    appointment = models.ForeignKey(Appointment, on_delete = models.CASCADE, related_name = "appointment")
    support_person = models.ForeignKey(User, on_delete = models.CASCADE, related_name = "support person")
    add_questions = models.BooleanField(default = False)
    add_answers = models.BooleanField(default = False)

    class Meta:
        db_table = "support_permission"

# download/access logs

class QuestionAccess(BaseModel):
    question = models.ForeignKey(Question, on_delete = models.CASCADE, related_name = "question")
    support_person = models.ForeignKey(User, on_delete = models.CASCADE, related_name = "support person")

    class Meta:
        db_table = "question_access"

class AppointmentAccess(BaseModel):
    appointment = models.ForeignKey(Appointment, on_delete = models.CASCADE, related_name = "appointment")
    support_person = models.ForeignKey(User, on_delete = models.CASCADE, related_name = "support person")

    class Meta:
        db_table = "appointment_access"

class Downloads(BaseModel):
    class DocumentType(models.TextChoices): CHART = "Chart", PAIN_PROF = "Pain Profile"
    type = models.CharField(default = DocumentType.CHART, max_length = 20, choices = DocumentType.choices)

    class Meta:
        db_table = "downloads"
