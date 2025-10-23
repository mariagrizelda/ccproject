"""
Local development URLs - includes all microservices in one server
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("authsvc.urls")),
    path("api/", include("coursessvc.urls")),
    path("api/", include("catalogsrv.urls")),
    path("api/", include("plannersvc.urls")),
]
