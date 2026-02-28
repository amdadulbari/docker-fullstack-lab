"""
Root URL Configuration — core/urls.py
──────────────────────────────────────
All API routes are namespaced under /api/v1/.
The /health endpoint sits at the root level for easy load-balancer checks.
"""

from django.contrib import admin
from django.urls import path, include
from tasks.views import health_check

urlpatterns = [
    # Django admin panel (useful for dev, disable in production if not needed)
    path('admin/', admin.site.urls),

    # Health check — root level so Docker / load balancers can hit it directly
    # e.g. GET /health  →  {"status": "ok", "database": "ok"}
    path('health', health_check, name='health-check'),

    # All Task API endpoints live under /api/v1/
    path('api/v1/', include('tasks.urls')),
]
