from django.contrib import admin
from .models import Appointment, AppointmentQuestion, AppointmentAnswer, AppointmentAccess
# Register your models here.

admin.site.register(Appointment)
admin.site.register(AppointmentQuestion)
admin.site.register(AppointmentAnswer)
admin.site.register(AppointmentAccess)