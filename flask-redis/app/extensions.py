"""
Extensions — app/extensions.py
────────────────────────────────
Initializes the Redis client as a module-level singleton.
All blueprints import 'redis_client' from here so there's only one connection pool.

decode_responses=True tells redis-py to return Python strings instead of bytes.
"""

import redis
from decouple import config

redis_client = redis.Redis(
    host=config('REDIS_HOST', default='redis'),
    port=config('REDIS_PORT', default=6379, cast=int),
    db=config('REDIS_DB',   default=0,    cast=int),
    password=config('REDIS_PASSWORD', default=None),
    decode_responses=True,   # ← always work with str, not bytes
    socket_connect_timeout=5,
)
