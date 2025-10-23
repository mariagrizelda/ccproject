from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from authsvc.models import Profile
from .serializers import RegisterSerializer, ProfileSerializer


@method_decorator(csrf_exempt, name='dispatch')
class HealthCheck(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        return Response({"status": "ok"})


class Register(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class Me(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = getattr(request.user, "profile", None)
        data = {
            "username": request.user.username,
            "email": request.user.email,
            "profile": ProfileSerializer(profile).data if profile else None,
        }
        return Response(data)


class UpdateProfile(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        try:
            profile = request.user.profile
            serializer = ProfileSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Profile.DoesNotExist:
            return Response({"detail": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
