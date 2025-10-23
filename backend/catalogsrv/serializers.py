from rest_framework import serializers
from catalogsrv.models import Program


class ProgramSerializer(serializers.ModelSerializer):
    level_label = serializers.CharField(source="get_level_display", read_only=True)

    class Meta:
        model = Program
        fields = ["id", "name", "level", "level_label"]
