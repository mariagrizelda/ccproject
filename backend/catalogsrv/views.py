from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from catalogsrv.models import Program
from .serializers import ProgramSerializer


@method_decorator(csrf_exempt, name='dispatch')
class HealthCheck(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        return Response({"status": "ok"})


class AssessmentTypes(APIView):
    """Return hardcoded assessment types (moved from Course model choices)"""
    def get(self, request):
        assessment_types = [
            {"value": "EXAM", "label": "Exam"},
            {"value": "PROJECT", "label": "Project"},
            {"value": "ASSIGNMENT", "label": "Assignment"},
            {"value": "MIX", "label": "Mix"},
        ]
        return Response(assessment_types)


class StudyAreas(APIView):
    """Return hardcoded study areas (moved from Course model choices)"""
    def get(self, request):
        study_areas = [
            {"value": "BEL", "label": "Business, Economics & Law"},
            {"value": "EAIT", "label": "Engineering, Architecture & Information Technology"},
            {"value": "HABS", "label": "Health & Behavioural Sciences"},
            {"value": "HMB", "label": "Health, Medicine and Behavioural Sciences"},
            {"value": "HASS", "label": "Humanities, Arts & Social Sciences"},
            {"value": "SCI", "label": "Science"},
        ]
        return Response(study_areas)


class ProgramLevels(APIView):
    def get(self, request):
        return Response([
            {"value": choice[0], "label": choice[1]} for choice in Program.ProgramLevel.choices
        ])


class Programs(APIView):
    def get(self, request):
        level = request.query_params.get("level")
        search = request.query_params.get("search", "").strip()
        
        qs = Program.objects.all()
        
        if level in dict(Program.ProgramLevel.choices):
            qs = qs.filter(level=level)
        
        if search:
            qs = qs.filter(name__icontains=search)
        
        # Limit results to prevent overwhelming the UI
        qs = qs[:50]
        
        return Response(ProgramSerializer(qs, many=True).data)
