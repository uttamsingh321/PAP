from django.http import JsonResponse


def reports_view(request):
    """Reports main view."""
    return JsonResponse({'status': 'success', 'data': {}})


def generate_report(request):
    """Generate a report."""
    return JsonResponse({'status': 'success', 'report_id': None})


def download_report(request, report_id):
    """Download a report."""
    return JsonResponse({'status': 'success', 'message': 'Download ready'})


def scheduled_reports(request):
    """Get scheduled reports."""
    return JsonResponse({'status': 'success', 'scheduled': []})


def report_templates(request):
    """Get report templates."""
    return JsonResponse({'status': 'success', 'templates': []})
