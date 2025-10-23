from rest_framework import serializers
from plannersvc.models import PlannedCourse, Semester


class SemesterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Semester
        fields = ["id", "semester_number", "created_at"]
        read_only_fields = ["created_at"]


class PlannedCourseSerializer(serializers.ModelSerializer):
    # No course FK relation - just store IDs and denormalized data
    class Meta:
        model = PlannedCourse
        fields = ["id", "course_id", "course_code", "course_name", "semester"]
