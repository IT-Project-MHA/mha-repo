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
    text = models.CharField(max_length = 50)
    class Meta: db_table = "question_option"

# multiselect/multiple choice question option with:
#       - order of appearance
#       - score value

class QuestionOptionOrdered(BaseModel):
    app_section = models.CharField(default = AppSection.MY_PAIN, max_length = 30, choices = AppSection.choices)
    text = models.CharField(max_length = 100)
    question_number = models.PositiveSmallIntegerField(default=0, validators = [MinValueValidator(0), MaxValueValidator(20)]) 
    option_number = models.PositiveSmallIntegerField(default=0)
    score = models.PositiveSmallIntegerField(default=0, validators = [MinValueValidator(0), MaxValueValidator(5)]) 
    class Meta: 
        db_table = "question_option_ordered"