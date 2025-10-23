from rest_framework import serializers
from plannersvc.models import PlannedCourse


class PlannedCourseSerializer(serializers.ModelSerializer):
    # No course FK relation - just store IDs and denormalized data
    class Meta:
        model = PlannedCourse
        fields = ["id", "course_id", "course_code", "course_name", "semester"]
