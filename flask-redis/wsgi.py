"""
WSGI Entry Point — wsgi.py
───────────────────────────
Gunicorn uses this file to serve the application in production.

Run command:
  gunicorn wsgi:app --bind 0.0.0.0:5000 --workers 3
"""

from app import create_app

# Create the Flask application instance
app = create_app()
