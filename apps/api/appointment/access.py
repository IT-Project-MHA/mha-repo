from django.db import transaction

from audit.models import AuditEntry
from audit.services import record
from appointment.models import (Appointment, AppointmentAccessLog, AppointmentQuestion, QuestionAccessLog)


@transaction.atomic
def record_appointment_view(actor, appointment: Appointment):
    # Log that user opened appointment

    entry = record(
        actor, AuditEntry.Action.VIEW, appointment,
        patient_profile = appointment.patient_profile,
    )

    AppointmentAccessLog.objects.create(appointment = appointment, support_person = actor)
    
    return entry


@transaction.atomic
def record_question_view(actor, question: AppointmentQuestion):
    # Log that user opened question

    entry = record(
        actor, AuditEntry.Action.VIEW, question,
        patient_profile = question.appointment.patient_profile,
    )

    QuestionAccessLog.objects.create(question = question, support_person = actor)

    return entry