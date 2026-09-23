from django.db import models
from mpowered_api.base_models import BaseModel
from django.core.validators import MaxValueValidator, MinValueValidator

class AppSection(models.TextChoices):
    ONBOARDING = "onboarding",
    MY_PAIN = "my_pain", 
    MY_MOVE = "my_movement", 
    MY_SOC_HEALTH = "my_social_health", 
    MY_PERS_CARE = "my_personal_care", 
    MY_MANAGE = "my_management"

# plain question option

class QuestionOption(BaseModel):
    app_section = models.CharField(default = AppSection.MY_PAIN, max_length = 30, choices = AppSection.choices)
    question_key = models.SlugField(max_length = 40)
    text = models.CharField(max_length = 50)
    sort_order = models.PositiveSmallIntegerField(default = 0)
    is_active = models.BooleanField(default = True)
    class Meta: 
        db_table = "question_option"
        ordering = ["question_key", "sort_order"]
        constraints = [
            models.UniqueConstraint(fields = ["question_key", "text"], name = "unique_option_per_question"),
        ]

# multiselect/multiple choice question option with:
#       - order of appearance
#       - score value

class QuestionOptionOrdered(BaseModel):
    app_section = models.CharField(default = AppSection.MY_PAIN, max_length = 30, choices = AppSection.choices)
    question_key = models.SlugField(max_length = 40)
    text = models.CharField(max_length = 100)
    question_number = models.PositiveSmallIntegerField(default=0, validators = [MinValueValidator(0), MaxValueValidator(20)]) 
    option_number = models.PositiveSmallIntegerField(default=0)
    score = models.PositiveSmallIntegerField(default=0, validators = [MinValueValidator(0), MaxValueValidator(5)]) 
    class Meta: 
        db_table = "question_option_ordered"
        ordering = ["question_key", "option_number"]
        constraints = [
            models.UniqueConstraint(fields = ["question_key", "option_number"], name = "unique_option_number_per_question"),
        ]
