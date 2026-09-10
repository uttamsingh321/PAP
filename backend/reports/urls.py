from django.urls import path
from . import views

urlpatterns = [
    path('', views.reports_view, name='reports'),
    path('generate/', views.generate_report, name='generate-report'),
    path('download/<str:report_id>/', views.download_report, name='download-report'),
    path('scheduled/', views.scheduled_reports, name='scheduled-reports'),
    path('templates/', views.report_templates, name='report-templates'),
]
