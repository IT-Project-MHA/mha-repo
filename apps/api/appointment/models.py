from django.db import models
from mpowered_api.base_models import BaseModel, SoftDeleteModel

class Appointment(BaseModel, SoftDeleteModel):

    class Status(models.TextChoices):
        PLANNED = "planned", "Planned"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    patient_profile = models.ForeignKey("accounts.PatientProfile", on_delete = models.PROTECT, related_name = "patient")
    scheduled_date = models.DateField()
    doctor = models.CharField(max_length = 100)
    status = models.CharField(choices = Status.choices, default = Status.PLANNED)
    care_person = models.ForeignKey("appointment.CarePerson", on_delete = models.SET_NULL, null = True, blank = True, related_name = "appointments")

    class HealthService(models.TextChoices):
        GP = "General Practitioner", "General Practitioner"
        PHY = "Physiotherapist", "Physiotherapist"
        RHE = "Rheumatologist", "Rheumatologist"
        OST = "Osteopath", "Osteopath"
        PMS = "Pain Medicine Specialist", "Pain Medicine Specialist"
        OS = "Orthopaedy Surgeon", "Orthopaedy Surgeon"
        OT = "Occupational Therapist", "Occupational Therapist"
        OTHER = "Other", "Other"
    health_service = models.CharField(default = HealthService.GP, max_length = 50, choices = HealthService.choices)

    created_by = models.ForeignKey("accounts.User", on_delete = models.PROTECT, related_name = "+")
    notes = models.TextField(blank = True)

    class Meta:
        db_table = "appointment"
        ordering = ["-scheduled_for"]
        indexes = [
            # Search by date
            models.Index(fields = ["date"], name = "appointment_by_date_idx"),
            # Search by patient
            models.Index(fields = ["patient_profile"], name = "appointment_by_patient_idx"),
        ]



class CarePerson(BaseModel, SoftDeleteModel):
    patient_profile = models.ForeignKey("accounts.PatientProfile", on_delete = models.PROTECT, related_name = "care_people")
    care_person_type = models.ForeignKey("reference.CarePersonType", on_delete = models.PROTECT,null = True, blank = True, related_name = "care_people",)
    name = models.CharField(max_length = 120)
    phone_number = models.CharField(max_length = 20, blank = True)
    email = models.EmailField(blank = True)

    class Meta:
        db_table = "care_person"
        ordering = ["name"]
        indexes = [models.Index(fields = ["patient_profile"], name = "care_person_by_patient_idx")]



class AppointmentQuestion(BaseModel, SoftDeleteModel):

    class Source(models.TextChoices):
        SUGGESTED = "suggested", "Suggested by MPOWERED"
        PATIENT = "patient", "Written by patient"
        SUPPORT = "support", "Written by support person"

    appointment = models.ForeignKey(Appointment, on_delete = models.PROTECT, related_name = "questions")
    text = models.TextField()
    source = models.CharField(max_length = 12, choices = Source.choices, default = Source.PATIENT)
    created_by = models.ForeignKey("accounts.User", on_delete = models.PROTECT, related_name = "+")
    order_index = models.PositiveSmallIntegerField(default = 0)
    is_selected = models.BooleanField(default = True)
    answer_recording = models.URLField(null= True, blank = True)

    class Meta:
        db_table = "appointment_question"
        ordering = ["order_index", "created_at"]
        indexes = [models.Index(fields = ["appointment", "order_index"], name = "question_by_appt_idx")]



class AppointmentAnswer(BaseModel, SoftDeleteModel):

    question = models.OneToOneField(AppointmentQuestion, on_delete = models.PROTECT, related_name = "answer")
    text = models.TextField(blank = True)
    recording_file = models.FileField(upload_to = "appointment-answers/%Y/%m/", null = True, blank = True)
    transcript = models.TextField(blank = True)
    recorded_by = models.ForeignKey("accounts.User", on_delete = models.PROTECT, related_name = "+")
    recorded_at = models.DateTimeField(auto_now_add = True)

    class Meta:
        db_table = "appointment_answer"



class AppointmentAccess(BaseModel):

    appointment = models.ForeignKey(Appointment, on_delete = models.PROTECT, related_name = "access_grants")
    support_link = models.ForeignKey("accounts.SupportLink", on_delete = models.PROTECT, related_name = "appointment_access")
    can_add_questions = models.BooleanField(default = False)
    can_record_answers = models.BooleanField(default = False)
    granted_at = models.DateTimeField(auto_now_add = True)
    revoked_at = models.DateTimeField(null = True, blank = True)

    last_accessed_at = models.DateTimeField(null=True, blank=True)
    last_accessed_by = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL,
        null=True, blank=True, related_name="+",
    )

    class Meta:
        db_table = "appointment_access"
        indexes = [models.Index(fields = ["appointment"], name = "access_by_appointment_idx")]


# Access logs

class QuestionAccessLog(BaseModel):
    question = models.ForeignKey(AppointmentQuestion, on_delete = models.CASCADE, related_name = "question")
    support_person = models.ForeignKey("accounts.User", on_delete = models.CASCADE, related_name = "support person")

    class Meta:
        db_table = "question_access"
        ordering = ["-created_at"]

class AppointmentAccessLog(BaseModel):
    appointment = models.ForeignKey(Appointment, on_delete = models.CASCADE, related_name = "appointment")
    support_person = models.ForeignKey("accounts.user", on_delete = models.CASCADE, related_name = "support person")

    class Meta:
        db_table = "appointment_access"
        ordering = ["-created_at"]