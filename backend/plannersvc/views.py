from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db import models
from plannersvc.models import PlannedCourse, Semester
from .serializers import PlannedCourseSerializer, SemesterSerializer


class HealthCheck(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        return Response({"status": "ok"})


class SemestersView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get all semesters for the user"""
        semesters = Semester.objects.filter(user=request.user)
        data = SemesterSerializer(semesters, many=True).data
        return Response(data)

    def post(self, request):
        """Add a new semester"""
        # Get the highest semester number for this user
        max_semester = Semester.objects.filter(user=request.user).aggregate(
            max_num=models.Max('semester_number')
        )['max_num']
        
        next_semester_number = (max_semester or 0) + 1
        
        semester = Semester.objects.create(
            user=request.user,
            semester_number=next_semester_number
        )
        
        return Response(
            SemesterSerializer(semester).data,
            status=status.HTTP_201_CREATED
        )

    def delete(self, request):
        """Delete the latest semester if it has no courses"""
        # Get the highest semester number for this user
        max_semester_obj = Semester.objects.filter(user=request.user).order_by('-semester_number').first()
        
        if not max_semester_obj:
            return Response(
                {"detail": "No semesters to delete"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if this semester has any courses
        has_courses = PlannedCourse.objects.filter(
            user=request.user,
            semester=max_semester_obj.semester_number
        ).exists()
        
        if has_courses:
            return Response(
                {"detail": "Cannot delete semester with courses. Remove all courses first."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        max_semester_obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PlannedCoursesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = PlannedCourse.objects.filter(user=request.user)
        data = PlannedCourseSerializer(qs, many=True).data
        return Response(data)

    def post(self, request):
        serializer = PlannedCourseSerializer(data=request.data)
        if serializer.is_valid():
            PlannedCourse.objects.update_or_create(
                user=request.user,
                course_id=serializer.validated_data["course_id"],
                defaults={
                    "semester": serializer.validated_data["semester"],
                    "course_code": serializer.validated_data.get("course_code", ""),
                    "course_name": serializer.validated_data.get("course_name", ""),
                },
            )
            qs = PlannedCourse.objects.filter(
                user=request.user, 
                course_id=serializer.validated_data["course_id"]
            )
            return Response(
                PlannedCourseSerializer(qs.first()).data, 
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        # Update semester for an existing planned course
        course_id = request.data.get("course_id")
        semester = request.data.get("semester")
        
        if not course_id or semester is None:
            return Response(
                {"detail": "course_id and semester are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            pc = PlannedCourse.objects.get(user=request.user, course_id=course_id) 
        except PlannedCourse.DoesNotExist:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        
        pc.semester = semester
        pc.save()
        return Response(PlannedCourseSerializer(pc).data)

    def delete(self, request):
        course_id = request.data.get("course_id")
        if not course_id:
            return Response(
                {"course_id": "This field is required."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        deleted, _ = PlannedCourse.objects.filter(
            user=request.user, 
            course_id=course_id
        ).delete()
        if deleted == 0:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)
