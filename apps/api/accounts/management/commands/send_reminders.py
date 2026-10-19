from datetime import timedelta

from django.core.management.base import BaseCommand

from accounts.models import User
from accounts.push_notification import send_push
from appointment.models import Appointment
from health.models import Assessment
from mpowered_api.validators import australian_day_range, current_date, current_week_starting

ASSESSMENT_TITLE = "Weekly check-in"
ASSESSMENT_BODY = "Your weekly check-in is ready when you are."
APPOINTMENT_TITLE = "Appointment reminder"
APPOINTMENT_BODY = "You have an appointment tomorrow."


class Command(BaseCommand):

    def add_arguments(self, parser):
        parser.add_argument("--assessments", action = "store_true",
                            help = "Remind patients who haven't submitted weekly check in")
        parser.add_argument("--appointments", action = "store_true",
                            help = "Remind patients with appointments tomorrow")

    def handle(self, *args, **options):
        if options["assessments"]:
            sent = send_push(assessment_due_users(), ASSESSMENT_TITLE, ASSESSMENT_BODY, {"screen": "assessment"})
            self.stdout.write(f"Assessment reminders sent to {sent} phones.")

        if options["appointments"]:
            sent = send_push(appointment_tomorrow_users(), APPOINTMENT_TITLE, APPOINTMENT_BODY, {"screen": "appointments"})
            self.stdout.write(f"Appointment reminders sent to {sent} phones.")


# helper function: live accounts with notifications enabled
def wants_notifications():
    return User.objects.filter(is_active = True, deleted_at__isnull = True) \
        .exclude(settings__notifications_enabled = False)


# helper function: patients tracking their health who havent submitted their weekly assessment
def assessment_due_users():
    submitted = Assessment.objects.filter(week_starting = current_week_starting(), status = Assessment.Status.SUBMITTED)
    return wants_notifications().filter(patient_profile__deleted_at__isnull = True) \
        .exclude(patient_profile__assessment_assessments__in = submitted)


# helper function: patients with appointments tomorrow
def appointment_tomorrow_users():
    start, end = australian_day_range(current_date() + timedelta(days = 1))
    appointments = Appointment.objects.filter(
        scheduled_date__gte = start,
        scheduled_date__lt = end,
        status = Appointment.Status.PLANNED,
        deleted_at__isnull = True,
    )
    return wants_notifications().filter(patient_profile__appointment_patient__in = appointments).distinct()