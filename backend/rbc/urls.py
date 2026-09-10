from django.urls import path
from . import views

urlpatterns = [
    path('', views.rbc_view, name='rbc'),
    path('users/', views.user_list, name='user-list'),
    path('users/<int:user_id>/', views.user_detail, name='user-detail'),
    path('roles/', views.role_list, name='role-list'),
    path('roles/<int:role_id>/', views.role_detail, name='role-detail'),
    path('permissions/', views.permission_list, name='permission-list'),
    path('commands/', views.command_list, name='command-list'),
    path('activity-log/', views.activity_log, name='activity-log'),
    path('super-users/', views.super_user_list, name='super-user-list'),
]
