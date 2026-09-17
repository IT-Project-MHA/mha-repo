from django.contrib import admin
from .models import *

# Register your models here.
admin.site.register(AuditEntry)
admin.site.register(QuestionAccessLog)
admin.site.register(AppointmentAccessLog)