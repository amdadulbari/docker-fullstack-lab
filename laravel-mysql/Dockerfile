# ─── Stage 1: Install Composer dependencies ───────────────────────
FROM php:8.4-cli-alpine AS builder

WORKDIR /app

# Install system dependencies and PHP extensions needed by Laravel
RUN apk add --no-cache \
        curl \
        zip \
        unzip \
        git \
        libpng-dev \
        oniguruma-dev \
        libxml2-dev \
    && docker-php-ext-install pdo_mysql mbstring xml

# Install Composer
COPY --from=composer:2.8 /usr/bin/composer /usr/bin/composer

# Copy dependency definition and install (without dev deps for production)
COPY composer.json .
RUN composer install --no-dev --no-scripts --optimize-autoloader --no-interaction

# Copy full application source
COPY . .

# Create required directories and run post-install scripts
RUN mkdir -p bootstrap/cache storage/logs storage/framework/cache storage/framework/sessions storage/framework/views \
    && chmod -R 775 bootstrap/cache storage \
    && composer dump-autoload --optimize

# ─── Stage 2: Production image ────────────────────────────────────
FROM php:8.4-cli-alpine AS production

WORKDIR /app

# Install only runtime PHP extensions
RUN apk add --no-cache libpng-dev oniguruma-dev libxml2-dev \
    && docker-php-ext-install pdo_mysql mbstring xml

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy app from builder
COPY --from=builder /app /app

# Create storage directories Laravel needs and set permissions
RUN mkdir -p storage/logs storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache \
    && chown -R appuser:appgroup /app \
    && chmod +x /app/entrypoint.sh

USER appuser

EXPOSE 8000

ENTRYPOINT ["./entrypoint.sh"]
