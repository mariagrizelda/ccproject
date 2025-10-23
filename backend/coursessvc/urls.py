from django.urls import path
import coursessvc.views

urlpatterns = [
    path("courses/health/", coursessvc.views.HealthCheck.as_view(), name="courses-health"),
    path("courses/", coursessvc.views.CourseList.as_view(), name="course-list"),
    path("courses/<int:course_id>/", coursessvc.views.CourseDetail.as_view(), name="course-detail"),
    path("courses/<int:course_id>/reviews/", coursessvc.views.CourseReviews.as_view(), name="course-reviews"),
]
