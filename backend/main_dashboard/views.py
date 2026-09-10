from django.http import JsonResponse
from django.shortcuts import render


def dashboard_view(request):
    """Main dashboard view."""
    return JsonResponse({'status': 'success', 'data': {}})


def kpi_data(request):
    """Return KPI data for the dashboard."""
    return JsonResponse({'status': 'success', 'kpis': []})


def chart_data(request):
    """Return chart data for the dashboard."""
    return JsonResponse({'status': 'success', 'charts': []})


def table_data(request):
    """Return table data for the dashboard."""
    return JsonResponse({'status': 'success', 'tables': []})


def trend_data(request):
    """Return trend data for the dashboard."""
    return JsonResponse({'status': 'success', 'trends': []})


def widget_list(request):
    """Return list of available widgets."""
    return JsonResponse({'status': 'success', 'widgets': []})


def layout_view(request):
    """Save/Load dashboard layout."""
    return JsonResponse({'status': 'success', 'layout': {}})
