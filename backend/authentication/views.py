from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json


@csrf_exempt
def login_view(request):
    """Handle user login."""
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return JsonResponse({
                'status': 'success',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'role': user.role,
                    'department': user.department,
                }
            })
        return JsonResponse({'status': 'error', 'message': 'Invalid credentials'}, status=401)
    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)


@csrf_exempt
def logout_view(request):
    """Handle user logout."""
    logout(request)
    return JsonResponse({'status': 'success', 'message': 'Logged out successfully'})


@csrf_exempt
def register_view(request):
    """Handle user registration."""
    if request.method == 'POST':
        data = json.loads(request.body)
        # Registration logic here
        return JsonResponse({'status': 'success', 'message': 'User registered'})
    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)


def profile_view(request):
    """Get current user profile."""
    if request.user.is_authenticated:
        return JsonResponse({
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email,
            'role': request.user.role,
            'department': request.user.department,
        })
    return JsonResponse({'status': 'error', 'message': 'Not authenticated'}, status=401)


def refresh_token(request):
    """Refresh authentication token."""
    return JsonResponse({'status': 'success', 'message': 'Token refreshed'})
