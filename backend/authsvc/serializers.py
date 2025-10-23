from rest_framework import serializers
from django.contrib.auth.models import User
from shared.models import Profile


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
