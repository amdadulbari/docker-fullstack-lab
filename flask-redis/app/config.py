"""
Configuration — app/config.py
───────────────────────────────
All configuration values come from environment variables via python-decouple.
python-decouple reads from: .env file → OS environment → default value (in that order).

Never hardcode secrets here. Use .env for local dev, real env vars in production.
"""

from decouple import config


class Config:
    # ── Flask Core ────────────────────────────────────────────────
    SECRET_KEY = config('SECRET_KEY', default='change-me-in-production')
    DEBUG = config('DEBUG', default=False, cast=bool)

    # ── Redis Connection ──────────────────────────────────────────
    # REDIS_HOST = 'redis' when running in Docker (matches service name)
    # REDIS_HOST = 'localhost' when running locally
    REDIS_HOST = config('REDIS_HOST', default='redis')
    REDIS_PORT = config('REDIS_PORT', default=6379, cast=int)
    REDIS_DB   = config('REDIS_DB',   default=0,    cast=int)

    # Optional password — None means no auth (fine for local dev)
    REDIS_PASSWORD = config('REDIS_PASSWORD', default=None)
