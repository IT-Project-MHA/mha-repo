from django.contrib import admin
from .models import PainType, PainCharacteristic, PainLocation
# Register your models here.

admin.site.register(PainLocation)
admin.site.register(PainCharacteristic)
admin.site.register(PainType)