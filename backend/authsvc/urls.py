from django.urls import path
import authsvc.views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("auth/health/", authsvc.views.HealthCheck.as_view(), name="auth-health"),
    path("auth/register/", authsvc.views.Register.as_view(), name="register"),
    path("auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/me/", authsvc.views.Me.as_view(), name="me"),
    path("auth/profile/", authsvc.views.UpdateProfile.as_view(), name="update-profile"),
]
