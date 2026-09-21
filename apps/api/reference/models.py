from django.db import models
from mpowered_api.base_models import BaseModel
from django.core.validators import MaxValueValidator, MinValueValidator

# specific question multiselect values

class PainType(BaseModel):
    type = models.CharField(max_length = 50)
    class Meta: db_table = "pain_type"

class PainCharacteristic(BaseModel):
    type = models.CharField(max_length = 50)
    class Meta: 
        db_table = "pain_characteristic"

class PainLocation(BaseModel):
    type = models.CharField(max_length = 50)
    class Meta: 
        db_table = "pain_location"

# question multiselect/multiple choice with text, order of appearance and score value

class AssessmentStatement(BaseModel):
    class AppSection(models.TextChoices):
        MY_PAIN = "my_pain", 
        MY_MOVE = "my_movement", 
        MY_SOC_HEALTH = "my_social_health", 
        MY_PERS_CARE = "my_personal_care", 
        MY_MANAGE = "my_management"
    app_section = models.CharField(default = AppSection.MY_PAIN, max_length = 30, choices = AppSection.choices)

    question_number = models.PositiveSmallIntegerField(default=0, validators = [MinValueValidator(0), MaxValueValidator(20)]) 
    statement_number = models.PositiveSmallIntegerField(default=0)
    statement_text = models.CharField(max_length = 100)
    score = models.PositiveSmallIntegerField(default=0, validators = [MinValueValidator(0), MaxValueValidator(5)]) 

    class Meta: 
        db_table = "assessment_statement"