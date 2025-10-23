from django.conf import settings
from django.db import models


class Profile(models.Model):
    class ProgramLevel(models.TextChoices):
        UNDERGRAD = "UNDERGRAD", "Under Graduate"
        POSTGRAD = "POSTGRAD", "Post Graduate"

    class YearIntake(models.TextChoices):
        SEM1 = "SEM1", "Semester 1"
        SEM2 = "SEM2", "Semester 2"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile"
    )
    program_level = models.CharField(
        max_length=16, choices=ProgramLevel.choices
    )
    program = models.CharField(max_length=255)
    year_intake = models.CharField(
        max_length=8, choices=YearIntake.choices
    )

    def __str__(self) -> str:
        return f"{self.user.email or self.user.username} - {self.program}"
