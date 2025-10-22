from django.urls import path
import api.views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("health/", api.views.HealthCheck.as_view(), name="health"),
    path("courses/", api.views.CourseList.as_view(), name="course-list"),
    path("courses/<int:course_id>/", api.views.CourseDetail.as_view(), name="course-detail"),
    path("courses/<int:course_id>/reviews/", api.views.CourseReviews.as_view(), name="course-reviews"),
    path("assessment-types/", api.views.AssessmentTypes.as_view(), name="assessment-types"),
    path("study-areas/", api.views.StudyAreas.as_view(), name="study-areas"),
    path("auth/register/", api.views.Register.as_view(), name="register"),
    path("auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/me/", api.views.Me.as_view(), name="me"),
    path("auth/profile/", api.views.UpdateProfile.as_view(), name="update-profile"),
    path("planned-courses/", api.views.PlannedCoursesView.as_view(), name="planned-courses"),
    path("program-levels/", api.views.ProgramLevels.as_view(), name="program-levels"),
    path("programs/", api.views.Programs.as_view(), name="programs"),
]