from django.http import JsonResponse


def smt_view(request):
    """SMT main view."""
    return JsonResponse({'status': 'success', 'data': {}})


def production_data(request):
    """Return SMT production data."""
    return JsonResponse({'status': 'success', 'production': []})


def efficiency_data(request):
    """Return SMT efficiency data."""
    return JsonResponse({'status': 'success', 'efficiency': []})


def downtime_data(request):
    """Return SMT downtime data."""
    return JsonResponse({'status': 'success', 'downtime': []})


def defect_data(request):
    """Return SMT defect data."""
    return JsonResponse({'status': 'success', 'defects': []})


def machine_list(request):
    """Return list of SMT machines."""
    return JsonResponse({'status': 'success', 'machines': []})


def line_list(request):
    """Return list of SMT lines."""
    return JsonResponse({'status': 'success', 'lines': []})


def trend_data(request):
    """Return SMT trend data."""
    return JsonResponse({'status': 'success', 'trends': []})


def chart_data(request):
    """Return SMT chart data."""
    return JsonResponse({'status': 'success', 'charts': []})
