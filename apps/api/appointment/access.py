from django.db import transaction

from audit.models import AuditEntry, AppointmentAccessLog, QuestionAccessLog
from audit.services import is_someone_elses, record_view


def record_appointment_view(actor, appointment):

    if not is_someone_elses(actor, appointment):
        return None

    with transaction.atomic():
        entry = record_view(actor, appointment)
        AppointmentAccessLog.objects.create(appointment = appointment, support_person = actor)

    return entry


def record_question_view(actor, question):

    if not is_someone_elses(actor, question):
        return None

    with transaction.atomic():
        entry = record_view(actor, question)
        QuestionAccessLog.objects.create(question = question, support_person = actor)

    return entry