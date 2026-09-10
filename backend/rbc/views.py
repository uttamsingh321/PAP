from django.http import JsonResponse


def rbc_view(request):
    """RBC main view."""
    return JsonResponse({'status': 'success', 'data': {}})


def user_list(request):
    """Return list of users."""
    return JsonResponse({'status': 'success', 'users': []})


def user_detail(request, user_id):
    """Return user details."""
    return JsonResponse({'status': 'success', 'user': {}})


def role_list(request):
    """Return list of roles."""
    return JsonResponse({'status': 'success', 'roles': []})


def role_detail(request, role_id):
    """Return role details."""
    return JsonResponse({'status': 'success', 'role': {}})


def permission_list(request):
    """Return list of permissions."""
    return JsonResponse({'status': 'success', 'permissions': []})


def command_list(request):
    """Return list of commands."""
    return JsonResponse({'status': 'success', 'commands': []})


def activity_log(request):
    """Return activity log."""
    return JsonResponse({'status': 'success', 'logs': []})


def super_user_list(request):
    """Return list of super users."""
    return JsonResponse({'status': 'success', 'super_users': []})
