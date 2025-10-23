from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db import models
from coursessvc.models import Course, CourseReview
from .serializers import CourseSerializer, CourseReviewSerializer


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
