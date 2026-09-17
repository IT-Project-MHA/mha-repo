from django.contrib import admin
from .models import UserManager, User, PatientProfile, UserSettings, SupportLink, TermsAndPrivacy
# Register your models here.

admin.site.register(UserManager)
admin.site.register(User)
admin.site.register(PatientProfile)
admin.site.register(UserSettings)
admin.site.register(SupportLink)
admin.site.register(TermsAndPrivacy)