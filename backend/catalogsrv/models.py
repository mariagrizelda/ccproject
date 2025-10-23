from django.db import models


class Program(models.Model):
    class ProgramLevel(models.TextChoices):
        UNDERGRAD = "UNDERGRAD", "Undergraduate"
        POSTGRAD = "POSTGRAD", "Postgraduate"

    name = models.CharField(max_length=255, unique=True)
    level = models.CharField(max_length=16, choices=ProgramLevel.choices)

    def __str__(self) -> str:
        return f"{self.name} ({self.get_level_display()})"
