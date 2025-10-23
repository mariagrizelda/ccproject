from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models


class Course(models.Model):
    class AssessmentType(models.TextChoices):
        EXAM = "EXAM", "Exam"
        PROJECT = "PROJECT", "Project"
        ASSIGNMENT = "ASSIGNMENT", "Assignment"
        MIX = "MIX", "Mix"

    class StudyArea(models.TextChoices):
        BEL = "BEL", "Business, Economics & Law"
        EAIT = "EAIT", "Engineering, Architecture & Information Technology"
        HABS = "HABS", "Health & Behavioural Sciences"
        HMB = "HMB", "Health, Medicine and Behavioural Sciences"
        HASS = "HASS", "Humanities, Arts & Social Sciences"
        SCI = "SCI", "Science"

    name = models.CharField(max_length=255)
    code = models.CharField(max_length=32, unique=True)
    level = models.PositiveSmallIntegerField()
    credits = models.PositiveSmallIntegerField()
    aim = models.TextField()
    assessment_type = models.CharField(
        max_length=16,
        choices=AssessmentType.choices,
        null=True,
        blank=True,
    )
    study_area = models.CharField(
        max_length=128,
        choices=StudyArea.choices,
        null=True,
        blank=True,
    )
    offered_sem_1 = models.BooleanField(default=False)
    offered_sem_2 = models.BooleanField(default=False)
    offered_summer = models.BooleanField(default=False)
    description = models.TextField()

    prerequisites = models.ManyToManyField(
        "self",
        symmetrical=False,
        through="CoursePrerequisite",
        related_name="unlocking_courses",
        blank=True,
    )


class Assessment(models.Model):
    class GradingType(models.TextChoices):
        PERCENTAGE = "percentage", "Percentage"
        PASS_FAIL = "pass_fail", "Pass/Fail"
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="assessments"
    )
    category = models.CharField(max_length=255)
    task = models.CharField(max_length=255)
    mode = models.CharField(max_length=255)
    grading_type = models.CharField(
        max_length=20, choices=GradingType.choices, default=GradingType.PERCENTAGE
    )
    weight = models.PositiveSmallIntegerField(
        blank=True, null=True, 
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    description = models.TextField()
    hurdle = models.BooleanField(default=False)
    hurdle_description = models.TextField(blank=True, null=True)


class CourseReview(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="course_reviews"
    )
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="reviews"
    )
    review = models.DecimalField(
        max_digits=2,
        decimal_places=1,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
    )
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [("user", "course")]


class CoursePrerequisite(models.Model):
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="prereq_links"
    )
    prereq = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="as_prerequisite_for"
    )

    class Meta:
        unique_together = [("course", "prereq")]
        constraints = [
            models.CheckConstraint(
                check=~models.Q(course=models.F("prereq")),
                name="course_prereq_no_self_ref",
            ),
        ]
