"""
Task Views — tasks/views.py
────────────────────────────
Defines the API logic for:
  - CRUD operations on Tasks (via ModelViewSet)
  - Health check endpoint (manual function-based view)

ModelViewSet automatically provides:
  list()     → GET    /api/v1/tasks/
  create()   → POST   /api/v1/tasks/
  retrieve() → GET    /api/v1/tasks/<id>/
  update()   → PUT    /api/v1/tasks/<id>/
  partial_update() → PATCH /api/v1/tasks/<id>/
  destroy()  → DELETE /api/v1/tasks/<id>/
"""

from django.db import connection
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Task
from .serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    """
    Full CRUD for the Task resource.
    Inheriting ModelViewSet wires all 6 actions automatically.
    """

    queryset = Task.objects.all()
    serializer_class = TaskSerializer

    def get_queryset(self):
        """
        Optionally filter tasks by completion status.
        Usage: GET /api/v1/tasks/?completed=true
        """
        queryset = super().get_queryset()
        completed = self.request.query_params.get('completed')

        if completed is not None:
            # Convert string 'true'/'false' to boolean
            queryset = queryset.filter(completed=completed.lower() == 'true')

        return queryset


@api_view(['GET'])
def health_check(request):
    """
    Health Check — GET /health

    Used by Docker, Kubernetes, or load balancers to verify the app is alive.
    Also pings the database to confirm the connection is healthy.

    Returns:
        200 OK  — everything is fine
        500     — database is unreachable
    """
    try:
        # Run a trivial DB query to verify connectivity
        connection.ensure_connection()
        db_status = 'ok'
    except Exception as e:
        return Response(
            {
                'status': 'error',
                'database': 'unreachable',
                'detail': str(e),
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return Response(
        {
            'status': 'ok',
            'database': db_status,
            'timestamp': timezone.now().isoformat(),
        },
        status=status.HTTP_200_OK,
    )
