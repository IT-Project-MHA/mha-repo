from django.urls import path
from . import views
from .views import *

urlpatterns = [
    path('auditEntry/', 
         views.AuditEntryList.as_view(), 
         name ='read_audit_entry'),
    path('auditEntry/<str:pk>', 
         views.AuditEntryRetrieve.as_view(), 
         name ='read_audit_entry')
]