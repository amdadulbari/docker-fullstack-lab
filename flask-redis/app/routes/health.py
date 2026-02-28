"""
Health Check Route — app/routes/health.py
──────────────────────────────────────────
GET /health

Used by Docker, Kubernetes, or load balancers to verify the service is alive.
Pings Redis to confirm the connection is healthy, not just that Flask is running.
"""

from datetime import datetime, timezone
from flask import Blueprint, jsonify
from app.extensions import redis_client

# Blueprint groups related routes into a module
health_bp = Blueprint('health', __name__)


@health_bp.route('/health', methods=['GET'])
def health_check():
    """
    Returns the health status of the app and Redis connection.

    Response codes:
        200 → everything is fine
        500 → Redis is unreachable
    """
    try:
        # redis.ping() returns True if the server responds with PONG
        redis_client.ping()
        redis_status = 'ok'
    except Exception as e:
        return jsonify({
            'status': 'error',
            'redis':  'unreachable',
            'detail': str(e),
        }), 500

    return jsonify({
        'status':    'ok',
        'redis':     redis_status,
        'timestamp': datetime.now(timezone.utc).isoformat(),
    }), 200
