from django.conf import settings
from django.db import models


class Semester(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="semesters"
    )
    semester_number = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [("user", "semester_number")]
        ordering = ["semester_number"]

    def __str__(self):
        return f"Semester {self.semester_number}"


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
