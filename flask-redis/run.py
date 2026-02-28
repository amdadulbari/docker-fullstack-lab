"""
Local Development Server — run.py
───────────────────────────────────
Use this ONLY for local development.
In production, Gunicorn (via Docker) serves the app instead.

Usage:
  python run.py
"""

from app import create_app

app = create_app()

if __name__ == '__main__':
    # debug=True enables auto-reload and detailed error pages
    # Never use debug=True in production
    app.run(host='0.0.0.0', port=5000, debug=app.config.get('DEBUG', False))
