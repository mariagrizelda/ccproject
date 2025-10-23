from django.conf import settings
from django.db import models


class PlannedCourse(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="planned_courses"
    )
    # Store course_id as integer to avoid cross-service FK dependency
    course_id = models.IntegerField()
    course_code = models.CharField(max_length=32)  # Denormalized for display
    course_name = models.CharField(max_length=255)  # Denormalized for display
    semester = models.IntegerField()

    class Meta:
        unique_together = [("user", "course_id", "semester")]
