"""
Custom middleware to exempt health check endpoints from CSRF protection
"""
from django.utils.deprecation import MiddlewareMixin
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse


class CSRFExemptHealthChecks(MiddlewareMixin):
    """
    Middleware to exempt health check endpoints from CSRF protection
    """
    
    def process_view(self, request, view_func, view_args, view_kwargs):
        # Check if this is a health check endpoint
        if request.path.endswith('/health/') and request.method == 'GET':
            # Exempt from CSRF
            return csrf_exempt(view_func)(request, *view_args, **view_kwargs)
        return None
