from django.contrib import admin
from .models import QuestionOption, QuestionOptionOrdered
# Register your models here.

admin.site.register(QuestionOption)
admin.site.register(QuestionOptionOrdered)