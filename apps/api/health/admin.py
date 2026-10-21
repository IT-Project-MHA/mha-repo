from django.contrib import admin
from .models import MyPersonalCare, Prescription, MyPain, MyManagement, MyMovement, MySocialHealth, Assessment

# Register your models here.
admin.site.register(Assessment)
admin.site.register(Prescription)

admin.site.register(MyPain)
admin.site.register(MyPersonalCare)
admin.site.register(MySocialHealth)
admin.site.register(MyMovement)
admin.site.register(MyManagement)

