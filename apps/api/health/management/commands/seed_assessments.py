# health/management/commands/seed_assessments.py
import random
from datetime import timedelta

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone
from faker import Faker

from accounts.models import PatientProfile
from health.models import (
    Assessment, MyManagement, MyMovement, MyPain, MyPersonalCare,
    MySocialHealth, Prescription,
)
from reference.models import QuestionOption, QuestionOptionOrdered

fake = Faker()


def pick(model, key):
    """One random option for a question_key, or None if none exist."""
    return model.objects.filter(question_key=key).order_by("?").first()


def pick_many(model, key, lo=0, hi=3):
    opts = list(model.objects.filter(question_key=key))
    return random.sample(opts, min(len(opts), random.randint(lo, hi)))


class Command(BaseCommand):
    help = "Seed fake weekly assessments for a patient"

    def add_arguments(self, parser):
        parser.add_argument("--patient-id", help="PatientProfile pk (default: first one)")
        parser.add_argument("--weeks", type=int, default=12)
        parser.add_argument("--clear", action="store_true",
                            help="Delete this patient's assessments first")

    @transaction.atomic
    def handle(self, *args, **opts):
        random.seed(42)
        Faker.seed(42)

        qs = PatientProfile.objects.all()
        patient = qs.filter(pk=opts["patient_id"]).first() if opts["patient_id"] else qs.first()
        if not patient:
            raise CommandError("No PatientProfile found. Create a patient (sign up in the app) first.")

        if opts["clear"]:
            Assessment.objects.filter(patient_profile=patient).delete()

        prescriptions = self.ensure_prescriptions(patient)

        now = timezone.now()
        this_monday = (now - timedelta(days=now.weekday())).date()

        for n in range(opts["weeks"]):
            week = this_monday - timedelta(weeks=n)
            when = now - timedelta(weeks=n)

            # Current week = draft with nothing filled in (empty-state edge case),
            # week 1 = draft partially filled, week 2 = expired, rest = submitted.
            if n == 0:
                status, sections = Assessment.Status.DRAFT, 0
            elif n == 1:
                status, sections = Assessment.Status.DRAFT, 2
            elif n == 2:
                status, sections = Assessment.Status.EXPIRED, 1
            else:
                status, sections = Assessment.Status.SUBMITTED, 5

            assessment, _ = Assessment.objects.update_or_create(
                patient_profile=patient,
                week_starting=week,
                defaults={
                    "status": status,
                    "submitted_at": when if status == Assessment.Status.SUBMITTED else None,
                    "reflection": fake.sentence(nb_words=12)[:300] if random.random() < 0.6 else None,
                },
            )
            self.fill_sections(assessment, sections, when, prescriptions, extreme=(n == 3))

        self.stdout.write(self.style.SUCCESS(
            f"Seeded {opts['weeks']} assessments for patient {patient.pk}"))

    def ensure_prescriptions(self, patient):
        if not patient.prescriptions.exists():
            for name, strength, unit in [("Ibuprofen", 200, "mg"), ("Gabapentin", 300, "mg"),
                                         ("Naproxen", 500, "mg")]:
                Prescription.objects.create(
                    patient_profile=patient, name=name, dosage=1, strength=strength,
                    strength_unit=unit, frequency=random.choice([8, 12, 24]),
                    started_on=timezone.now().date() - timedelta(days=90),
                )
        return list(patient.prescriptions.all())

    def fill_sections(self, a, count, when, prescriptions, extreme=False):
        """Create the first `count` sections (of 5). `extreme` uses min/max values."""
        def val(lo, hi):
            return random.choice([lo, hi]) if extreme else random.randint(lo, hi)

        done = when if count else None
        builders = [
            lambda: self.pain(a, when, val),
            lambda: self.movement(a, when, val),
            lambda: self.personal_care(a, when, val),
            lambda: self.social(a, when, val),
            lambda: self.management(a, when, val, prescriptions),
        ]
        for build in builders[:count]:
            build()

    def pain(self, a, when, val):
        p, _ = MyPain.objects.update_or_create(assessment=a, defaults=dict(
            current=val(0, 10), worst=val(0, 10), average=val(0, 10), mildest=val(0, 10),
            other_location=fake.word() if random.random() < 0.2 else None,
            other_characteristic=fake.word() if random.random() < 0.2 else None,
            completed_at=when,
        ))
        p.locations.set(pick_many(QuestionOption, "pain_location", 1, 3))
        p.characteristics.set(pick_many(QuestionOption, "pain_characteristic", 1, 3))

    def movement(self, a, when, val):
        m, _ = MyMovement.objects.update_or_create(assessment=a, defaults=dict(
            active_hours=val(0, 168),
            walking=pick(QuestionOptionOrdered, "movement_walking"),
            sitting=pick(QuestionOptionOrdered, "movement_sitting"),
            lifting=pick(QuestionOptionOrdered, "movement_lifting"),
            standing=pick(QuestionOptionOrdered, "movement_standing"),
            reflection=fake.sentence(nb_words=10)[:300],
            score=val(0, 26), completed_at=when,
        ))
        m.general_impacts.set(pick_many(QuestionOptionOrdered, "movement_general_impacts", 1, 3))

    def personal_care(self, a, when, val):
        c, _ = MyPersonalCare.objects.update_or_create(assessment=a, defaults=dict(
            personal_care=pick(QuestionOptionOrdered, "care_personal_care"),
            sleeping=pick(QuestionOptionOrdered, "care_sleeping"),
            reflection=fake.sentence(nb_words=10)[:300],
            score=val(0, 15), completed_at=when,
        ))
        c.general_activities_impact.set(pick_many(QuestionOptionOrdered, "care_general_impacts", 1, 3))

    def social(self, a, when, val):
        MySocialHealth.objects.update_or_create(assessment=a, defaults=dict(
            social_life=pick(QuestionOptionOrdered, "social_social_life"),
            travelling=pick(QuestionOptionOrdered, "social_travelling"),
            overall_mood=pick(QuestionOptionOrdered, "social_overall_mood"),
            mood=val(0, 10), relationships=val(0, 10), enjoyment_of_life=val(0, 10),
            reflection=fake.sentence(nb_words=10)[:300],
            score=val(0, 40), completed_at=when,
        ))

    def management(self, a, when, val, prescriptions):
        m, _ = MyManagement.objects.update_or_create(assessment=a, defaults=dict(
            otc_medication=fake.word().capitalize() if random.random() < 0.4 else None,
            exercise=pick(QuestionOptionOrdered, "management_exercise"),
            emotion=fake.sentence(nb_words=8)[:300],
            score=val(0, 20), completed_at=when,
        ))
        m.medication.set(random.sample(prescriptions, random.randint(0, len(prescriptions))))