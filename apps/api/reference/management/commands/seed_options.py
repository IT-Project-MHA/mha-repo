import json
from pathlib import Path

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from reference.models import QuestionOption, QuestionOptionOrdered

SEED_FILE = Path(__file__).resolve().parents[2] / "seed" / "options.json"


class Command(BaseCommand):

    @transaction.atomic

    def handle(self, *args, **options):
        with open(SEED_FILE) as f:
            data = json.load(f)

        # Plain options matched on question_key and text
        for question in data["question_options"]:
            for i, text in enumerate(question["options"]):
                QuestionOption.objects.update_or_create(
                    question_key = question["question_key"],
                    text = text,
                    defaults = {"app_section": question["app_section"], "sort_order": i, "is_active": True}
                )

            # Turn off options that were deleted as old answers still use them
            QuestionOption.objects.filter(question_key = question["question_key"]) \
                .exclude(text__in = question["options"]) \
                .update(is_active = False, updated_at = timezone.now())

        # Ordered options matched on question_key and option_number
        for question in data["question_options_ordered"]:
            for number, (text, score) in enumerate(question["options"], start = 1):
                QuestionOptionOrdered.objects.update_or_create(
                    question_key = question["question_key"],
                    option_number = number,
                    defaults = {"app_section": question["app_section"], "question_number": question["question_number"], 
                                "text": text, "score": score, "is_active": True})

            QuestionOptionOrdered.objects.filter(question_key = question["question_key"],
                                                 option_number__gt = len(question["options"])) \
                .update(is_active = False, updated_at = timezone.now())

        self.stdout.write("References finsihed")