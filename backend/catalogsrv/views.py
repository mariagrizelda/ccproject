from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from shared.models import Course, Program
from .serializers import ProgramSerializer


class HealthCheck(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        return Response({"status": "ok"})


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
