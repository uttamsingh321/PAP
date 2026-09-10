from django.urls import path
from . import views

urlpatterns = [
    path('', views.dashboard_view, name='dashboard'),
    path('kpis/', views.kpi_data, name='kpi-data'),
    path('charts/', views.chart_data, name='chart-data'),
    path('tables/', views.table_data, name='table-data'),
    path('trends/', views.trend_data, name='trend-data'),
    path('widgets/', views.widget_list, name='widget-list'),
    path('layout/', views.layout_view, name='layout'),
]
