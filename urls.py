from django.urls import path
from . import views
from .fpy_api import fpy_data
from .ng_ndf_api import ng_ndf_data

urlpatterns = [
    path('', views.assembly_view, name='assembly'),
    path('production/', views.production_data, name='production-data'),
    path('efficiency/', views.efficiency_data, name='efficiency-data'),
    path('downtime/', views.downtime_data, name='downtime-data'),
    path('defects/', views.defect_data, name='defect-data'),
    path('machines/', views.machine_list, name='machine-list'),
    path('lines/', views.line_list, name='line-list'),
    path('trends/', views.trend_data, name='trend-data'),
    path('charts/', views.chart_data, name='chart-data'),
    path('fpy/', fpy_data, name='fpy-data'),
    path('ng-ndf/', ng_ndf_data, name='ng-ndf-data'),
]
