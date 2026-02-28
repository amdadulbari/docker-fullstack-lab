"""
Task Serializer — tasks/serializers.py
───────────────────────────────────────
Converts Task model instances ↔ JSON.
DRF serializers handle validation automatically.
"""

from rest_framework import serializers
from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    """
    Serializes all Task fields.

    - read_only fields are returned in responses but ignored in requests.
    - 'title' is required (no blank=True on the model).
    - 'description' and 'completed' are optional.
    """

    class Meta:
        model = Task
        fields = [
            'id',
            'title',
            'description',
            'completed',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
