"""
Admin Registration — tasks/admin.py
─────────────────────────────────────
Registers the Task model with Django's built-in admin interface.
Access it at: http://localhost:8000/admin/
Create a superuser first: python manage.py createsuperuser
"""

from django.contrib import admin
from .models import Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    # Columns shown in the admin list view
    list_display = ('id', 'title', 'completed', 'created_at')

    # Clickable column (navigates to the edit form)
    list_display_links = ('id', 'title')

    # Filter sidebar on the right
    list_filter = ('completed',)

    # Search box at the top
    search_fields = ('title', 'description')

    # Default sort: newest first
    ordering = ('-created_at',)
