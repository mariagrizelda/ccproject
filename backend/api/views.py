from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Course, Program
from .serializers import CourseSerializer, RegisterSerializer, ProfileSerializer, ProgramSerializer

class CourseList(APIView):
    def get(self, request):
        queryset = Course.objects.all().order_by("code")
        data = CourseSerializer(queryset, many=True).data
        return Response(data)

class AssessmentTypes(APIView):
    def get(self, request):
        """Get all available assessment types from the model choices"""
        assessment_types = [
            {"value": choice[0], "label": choice[1]} 
            for choice in Course.AssessmentType.choices
        ]
        return Response(assessment_types)

class StudyAreas(APIView):
    def get(self, request):
        """Get all available study areas from the model choices"""
        study_areas = [
            {"value": choice[0], "label": choice[1]} 
            for choice in Course.StudyArea.choices
        ]
        return Response(study_areas)


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


class ProgramLevels(APIView):
    def get(self, request):
        return Response([
            {"value": choice[0], "label": choice[1]} for choice in Program.ProgramLevel.choices
        ])


class Programs(APIView):
    def get(self, request):
        level = request.query_params.get("level")
        qs = Program.objects.all()
        if level in dict(Program.ProgramLevel.choices):
            qs = qs.filter(level=level)
        return Response(ProgramSerializer(qs, many=True).data)