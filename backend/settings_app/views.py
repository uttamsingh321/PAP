from django.http import JsonResponse


def settings_view(request):
    """Settings main view."""
    return JsonResponse({'status': 'success', 'data': {}})


def general_settings(request):
    """Get/Update general settings."""
    return JsonResponse({'status': 'success', 'settings': {}})


def user_settings(request):
    """Get/Update user settings."""
    return JsonResponse({'status': 'success', 'settings': {}})


def notification_settings(request):
    """Get/Update notification settings."""
    return JsonResponse({'status': 'success', 'settings': {}})


def system_settings(request):
    """Get/Update system settings."""
    return JsonResponse({'status': 'success', 'settings': {}})
