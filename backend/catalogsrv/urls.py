from django.urls import path
import catalogsrv.views

urlpatterns = [
    path("catalog/health/", catalogsrv.views.HealthCheck.as_view(), name="catalog-health"),
    path("catalog/assessment-types/", catalogsrv.views.AssessmentTypes.as_view(), name="assessment-types"),
    path("catalog/study-areas/", catalogsrv.views.StudyAreas.as_view(), name="study-areas"),
    path("catalog/program-levels/", catalogsrv.views.ProgramLevels.as_view(), name="program-levels"),
    path("catalog/programs/", catalogsrv.views.Programs.as_view(), name="programs"),
]
