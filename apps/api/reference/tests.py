import json
from io import StringIO

from django.core.management import call_command
from rest_framework.test import APITestCase

from reference.management.commands.seed_options import SEED_FILE
from reference.models import QuestionOption, QuestionOptionOrdered

# Every question in the seed file, so the test follows the file when the wording changes
SEED = json.loads(SEED_FILE.read_text())
QUESTION_KEYS = {group["question_key"] for group in SEED["question_options"] + SEED["question_options_ordered"]}


# Seed command and the reference endpoints
class ReferenceTests(APITestCase):

    def setUp(self):
        call_command("seed_options", stdout = StringIO())

    def test_seed_loads_every_question(self):
        keys = set(QuestionOption.objects.values_list("question_key", flat = True)) | \
            set(QuestionOptionOrdered.objects.values_list("question_key", flat = True))
        self.assertEqual(keys, QUESTION_KEYS)

    def test_pain_types_open_without_login(self):
        response = self.client.get("/api/questionOption/?app_section=onboarding&question_key=pain_type")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data)
