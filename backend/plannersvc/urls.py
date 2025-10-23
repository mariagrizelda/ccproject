from django.urls import path
import plannersvc.views

urlpatterns = [
    path("planned-courses/health/", plannersvc.views.HealthCheck.as_view(), name="planner-health"),
    path("planned-courses/", plannersvc.views.PlannedCoursesView.as_view(), name="planned-courses"),
    path("planned-courses/semesters/", plannersvc.views.SemestersView.as_view(), name="semesters"),
]
