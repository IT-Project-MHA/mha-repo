from django.urls import path
from . import views
from .views import *

urlpatterns = [
    path('auditEntry/', 
         views.AuditEntryListCreate.as_view(), 
         name ='read_create_audit_entry'),
    path('auditEntry/<str:pk>', 
         views.AuditEntryRetrieveUpdateDestroy.as_view(), 
         name ='update_audit_entry')
]