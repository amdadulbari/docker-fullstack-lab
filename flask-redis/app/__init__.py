"""
Flask Application Factory — app/__init__.py
────────────────────────────────────────────
Uses the App Factory Pattern: create_app() builds and configures the
Flask instance. This makes the app easier to test and avoids circular imports.
"""

from flask import Flask
from .config import Config
from .extensions import redis_client
from .routes.health import health_bp
from .routes.notes import notes_bp


def create_app(config_class=Config):
    """
    Create and configure the Flask application.

    Using a factory function (instead of a module-level app object) allows:
    - Multiple app instances (e.g., one for tests, one for prod)
    - Cleaner extension initialization
    - Avoidance of circular import issues
    """
    app = Flask(__name__)

    # Load all config values (DB host, secret key, debug mode, etc.)
    app.config.from_object(config_class)

    # ── Register Blueprints ─────────────────────────────────
    # Blueprints are Flask's way of organizing routes into modules.
    # Each blueprint handles a specific area of the application.

    # /health — standalone health check (no prefix)
    app.register_blueprint(health_bp)

    # /api/v1/notes — all CRUD routes for notes
    app.register_blueprint(notes_bp, url_prefix='/api/v1')

    return app
