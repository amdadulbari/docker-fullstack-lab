"""
Task URL Configuration — tasks/urls.py
───────────────────────────────────────
Registers all routes for the tasks app.

DRF's DefaultRouter generates these URL patterns automatically:
  GET     /api/v1/tasks/          → list all tasks
  POST    /api/v1/tasks/          → create a task
  GET     /api/v1/tasks/<id>/     → get one task
  PUT     /api/v1/tasks/<id>/     → replace a task
  PATCH   /api/v1/tasks/<id>/     → partial update
  DELETE  /api/v1/tasks/<id>/     → delete a task

The health check is registered at root level in core/urls.py:
  GET     /health                 → app + db status
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet

# DefaultRouter auto-generates RESTful URLs for the ViewSet
router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')

urlpatterns = [
    # All CRUD routes for tasks
    path('', include(router.urls)),
]
