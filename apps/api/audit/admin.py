from django.contrib import admin
from .models import *



admin.site.register(AuditEntry)
admin.site.register(QuestionAccessLog)
admin.site.register(AppointmentAccessLog)