from django.contrib import admin
from .models import Course, Assessment, CourseReview, CoursePrerequisite, PlannedCourse, Profile, Program


admin.site.register(Course)
admin.site.register(Assessment)
admin.site.register(CourseReview)
admin.site.register(CoursePrerequisite)
admin.site.register(PlannedCourse)
admin.site.register(Profile)
admin.site.register(Program)
