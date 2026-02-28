FROM php:8.4-cli-alpine

WORKDIR /app

# Install PDO MySQL extension (not enabled by default in php:cli-alpine)
RUN docker-php-ext-install pdo pdo_mysql

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy application files
COPY . .

RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 8080

# PHP's built-in server — perfect for development/demo
# In production, use nginx + php-fpm
CMD ["php", "-S", "0.0.0.0:8080", "public/index.php"]
