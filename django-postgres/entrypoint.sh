#!/bin/sh
# entrypoint.sh
# ─────────────────────────────────────────────────────────────
# Runs before the main server starts.
# 1. Applies any pending database migrations.
# 2. Launches Gunicorn as the production WSGI server.
#
# 'set -e' means the script exits immediately if any command fails.
# ─────────────────────────────────────────────────────────────

set -e

echo "──────────────────────────────────────────"
echo " Running database migrations..."
echo "──────────────────────────────────────────"
python manage.py migrate --noinput

echo "──────────────────────────────────────────"
echo " Starting Gunicorn server on port 8000..."
echo "──────────────────────────────────────────"

# exec replaces the shell process with gunicorn
# so signals (SIGTERM, etc.) go directly to gunicorn
exec gunicorn core.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -
