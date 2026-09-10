"""PAP URL Configuration"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('api/dashboard/', include('main_dashboard.urls')),
    path('api/assembly/', include('assembly.urls')),
    path('api/smt/', include('smt.urls')),
    path('api/rbc/', include('rbc.urls')),
    path('api/reports/', include('reports.urls')),
    path('api/settings/', include('settings_app.urls')),
]
