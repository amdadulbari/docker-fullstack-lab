"""
ASGI Configuration — core/asgi.py
───────────────────────────────────
Entry point for ASGI-compatible web servers (Uvicorn, Daphne).
Useful if you later add WebSockets or async views.
"""

import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

application = get_asgi_application()
