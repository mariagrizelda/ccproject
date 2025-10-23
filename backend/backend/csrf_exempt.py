"""
CSRF exemption for health check endpoints
"""
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView

def csrf_exempt_health_check(view_class):
    """
    Decorator to exempt health check views from CSRF protection
    """
    return method_decorator(csrf_exempt, name='dispatch')(view_class)
