from django.contrib import admin
from .models import AppSection, QuestionOption, QuestionOptionOrdered
# Register your models here.

admin.site.register(AppSection) # not sure if we need this
admin.site.register(QuestionOption)
admin.site.register(QuestionOptionOrdered)