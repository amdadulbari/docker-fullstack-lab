"""
WSGI Configuration — core/wsgi.py
───────────────────────────────────
Entry point for WSGI-compatible web servers (Gunicorn, uWSGI).
Gunicorn uses this file to serve the app in production.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

application = get_wsgi_application()
