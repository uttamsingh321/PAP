from django.urls import path
from . import views

urlpatterns = [
    path('', views.smt_view, name='smt'),
    path('production/', views.production_data, name='production-data'),
    path('efficiency/', views.efficiency_data, name='efficiency-data'),
    path('downtime/', views.downtime_data, name='downtime-data'),
    path('defects/', views.defect_data, name='defect-data'),
    path('machines/', views.machine_list, name='machine-list'),
    path('lines/', views.line_list, name='line-list'),
    path('trends/', views.trend_data, name='trend-data'),
    path('charts/', views.chart_data, name='chart-data'),
]
