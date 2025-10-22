from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth import authenticate
from django.db import models
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Course, Program, PlannedCourse, CourseReview
from .serializers import CourseSerializer, RegisterSerializer, ProfileSerializer, ProgramSerializer, PlannedCourseSerializer, CourseReviewSerializer

class HealthCheck(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        return Response({"status": "ok"})

class CourseDetail(APIView):
    def get(self, request, course_id):
        try:
            course = Course.objects.select_related().prefetch_related(
                'assessments', 'reviews__user'
            ).get(id=course_id)
            
            # Calculate average rating
            reviews = course.reviews.all()
            average_rating = reviews.aggregate(
                avg_rating=models.Avg('review')
            )['avg_rating'] or 0
            
            # Get prerequisites
            prerequisites = course.prerequisites.values_list('code', flat=True)
            
            course_data = CourseSerializer(course).data
            course_data['assessments'] = [
                {
                    'id': assessment.id,
                    'category': assessment.category,
                    'task': assessment.task,
                    'mode': assessment.mode,
                    'grading_type': assessment.grading_type,
                    'weight': assessment.weight,
                    'description': assessment.description,
                    'hurdle': assessment.hurdle,
                    'hurdle_description': assessment.hurdle_description,
                }
                for assessment in course.assessments.all()
            ]
            course_data['reviews'] = [
                {
                    'id': review.id,
                    'review': float(review.review),
                    'description': review.description,
                    'created_at': review.created_at.isoformat(),
                    'user': {'username': review.user.username}
                }
                for review in reviews
            ]
            course_data['average_rating'] = round(average_rating, 1)
            course_data['total_reviews'] = reviews.count()
            course_data['prerequisites'] = list(prerequisites)
            
            return Response(course_data)
        except Course.DoesNotExist:
            return Response(
                {"detail": "Course not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

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
        search = request.query_params.get("search", "").strip()
        
        qs = Program.objects.all()
        
        if level in dict(Program.ProgramLevel.choices):
            qs = qs.filter(level=level)
        
        if search:
            qs = qs.filter(name__icontains=search)
        
        # Limit results to prevent overwhelming the UI
        qs = qs[:50]
        
        return Response(ProgramSerializer(qs, many=True).data)


class PlannedCoursesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = PlannedCourse.objects.filter(user=request.user).select_related("course")
        data = PlannedCourseSerializer(qs, many=True).data
        return Response(data)

    def post(self, request):
        serializer = PlannedCourseSerializer(data=request.data)
        if serializer.is_valid():
            PlannedCourse.objects.update_or_create(
                user=request.user,
                course=serializer.validated_data["course"],
                defaults={"semester": serializer.validated_data["semester"]},
            )
            qs = PlannedCourse.objects.filter(user=request.user, course=serializer.validated_data["course"]).select_related("course")
            return Response(PlannedCourseSerializer(qs.first()).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        # Update semester for an existing planned course
        serializer = PlannedCourseSerializer(data=request.data)
        if serializer.is_valid():
            try:
                pc = PlannedCourse.objects.get(user=request.user, course=serializer.validated_data["course"]) 
            except PlannedCourse.DoesNotExist:
                return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)
            pc.semester = serializer.validated_data["semester"]
            pc.save()
            return Response(PlannedCourseSerializer(pc).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        course_id = request.data.get("course_id")
        if not course_id:
            return Response({"course_id": "This field is required."}, status=status.HTTP_400_BAD_REQUEST)
        deleted, _ = PlannedCourse.objects.filter(user=request.user, course_id=course_id).delete()
        if deleted == 0:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)


class CourseReviews(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, course_id):
        try:
            course = Course.objects.get(id=course_id)
            reviews = CourseReview.objects.filter(course=course).select_related('user')
            serializer = CourseReviewSerializer(reviews, many=True)
            return Response(serializer.data)
        except Course.DoesNotExist:
            return Response({"detail": "Course not found"}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request, course_id):
        try:
            course = Course.objects.get(id=course_id)
            serializer = CourseReviewSerializer(data=request.data)
            if serializer.is_valid():
                # Check if user already reviewed this course
                existing_review = CourseReview.objects.filter(
                    user=request.user, course=course
                ).first()
                
                if existing_review:
                    # Update existing review
                    existing_review.review = serializer.validated_data['review']
                    existing_review.description = serializer.validated_data.get('description', '')
                    existing_review.save()
                    return Response(CourseReviewSerializer(existing_review).data)
                else:
                    # Create new review
                    review = serializer.save(user=request.user, course=course)
                    return Response(CourseReviewSerializer(review).data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Course.DoesNotExist:
            return Response({"detail": "Course not found"}, status=status.HTTP_404_NOT_FOUND)


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