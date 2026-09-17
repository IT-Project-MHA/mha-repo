from django.contrib import admin
from .models import Appointment, CarePerson, AppointmentQuestion, AppointmentAnswer, AppointmentAccess
# Register your models here.

admin.site.register(Appointment)
admin.site.register(CarePerson)
admin.site.register(AppointmentQuestion)
admin.site.register(AppointmentAnswer)
admin.site.register(AppointmentAccess)