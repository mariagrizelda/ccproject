from rest_framework import serializers
from coursessvc.models import Course, CourseReview


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = "__all__"


class CourseReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = CourseReview
        fields = ["id", "review", "description", "created_at", "user"]
        read_only_fields = ["user", "created_at"]
