#!/bin/sh
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " Laravel Posts API — Starting..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Generate application key if not set
php artisan key:generate --force

# Run database migrations
echo " Running migrations..."
php artisan migrate --force

# Start PHP-FPM + nginx or just use Laravel's built-in server via php artisan serve
# For production, use php-fpm with nginx. For simplicity here we use artisan serve.
echo " Starting server on port 8000..."
exec php artisan serve --host=0.0.0.0 --port=8000
