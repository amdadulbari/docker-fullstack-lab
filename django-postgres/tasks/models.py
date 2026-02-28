"""
Task Model — tasks/models.py
─────────────────────────────
Defines the database schema for a Task.
Django automatically creates the table via migrations.
"""

from django.db import models


class Task(models.Model):
    """
    Represents a single to-do task.

    Fields:
        title       — short label for the task (required)
        description — optional longer explanation
        completed   — boolean flag; False by default
        created_at  — auto-set when the record is first saved
        updated_at  — auto-updated every time the record is saved
    """

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)   # set once on creation
    updated_at = models.DateTimeField(auto_now=True)       # updated on every save

    class Meta:
        # Return newest tasks first in any queryset
        ordering = ['-created_at']

    def __str__(self):
        # Shown in the Django admin list view
        status = '✓' if self.completed else '○'
        return f'[{status}] {self.title}'
