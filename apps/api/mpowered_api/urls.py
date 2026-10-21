from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),

    path('', include('accounts.urls')),
    path('', include('appointment.urls')),

    path('api/', include('health.urls')),
    path('api/', include('audit.urls')),
    path('api/', include('reference.urls'))
]
