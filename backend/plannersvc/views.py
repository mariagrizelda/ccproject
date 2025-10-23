from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from plannersvc.models import PlannedCourse
from .serializers import PlannedCourseSerializer


class HealthCheck(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        return Response({"status": "ok"})


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
