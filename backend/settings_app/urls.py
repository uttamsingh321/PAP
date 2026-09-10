from django.urls import path
from . import views

urlpatterns = [
    path('', views.settings_view, name='settings'),
    path('general/', views.general_settings, name='general-settings'),
    path('users/', views.user_settings, name='user-settings'),
    path('notifications/', views.notification_settings, name='notification-settings'),
    path('system/', views.system_settings, name='system-settings'),
]
