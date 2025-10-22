from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Course, Profile, Program, PlannedCourse, CourseReview

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = "__all__"


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["program_level", "program", "year_intake"]


class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, min_length=8)
    program_level = serializers.ChoiceField(choices=Profile.ProgramLevel.choices)
    program = serializers.CharField()
    year_intake = serializers.ChoiceField(choices=Profile.YearIntake.choices)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "program_level",
            "program",
            "year_intake",
        ]

    def create(self, validated_data):
        program_level = validated_data.pop("program_level")
        program = validated_data.pop("program")
        year_intake = validated_data.pop("year_intake")
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )
        Profile.objects.create(
            user=user,
            program_level=program_level,
            program=program,
            year_intake=year_intake,
        )
        return user


class ProgramSerializer(serializers.ModelSerializer):
    level_label = serializers.CharField(source="get_level_display", read_only=True)

    class Meta:
        model = Program
        fields = ["id", "name", "level", "level_label"]


class PlannedCourseSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    course_id = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(), source="course", write_only=True
    )

    class Meta:
        model = PlannedCourse
        fields = ["id", "course", "course_id", "semester"]


class CourseReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = CourseReview
        fields = ["id", "review", "description", "created_at", "user"]
        read_only_fields = ["user", "created_at"]
