"""
App Configuration — tasks/apps.py
────────────────────────────────────
Django uses this to identify and configure the 'tasks' application.
"""

from django.apps import AppConfig


class TasksConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'tasks'
