# ════════════════════════════════════════════════════════════════
# Dockerfile — Django + PostgreSQL
# Multi-stage build:
#   Stage 1 (builder) → installs Python dependencies into a venv
#   Stage 2 (production) → copies only what's needed, runs as non-root
# ════════════════════════════════════════════════════════════════

# ── Stage 1: Builder ─────────────────────────────────────────────
FROM python:3.12-slim AS builder

WORKDIR /app

# Install build-time system dependencies
# gcc + libpq-dev are needed to compile psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
        gcc \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Create an isolated virtual environment
# This makes it easy to copy the whole venv to the next stage
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python dependencies first (Docker layer caching: only re-run if requirements.txt changes)
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt


# ── Stage 2: Production ───────────────────────────────────────────
FROM python:3.12-slim AS production

WORKDIR /app

# Install only the runtime system library for PostgreSQL (smaller than dev package)
RUN apt-get update && apt-get install -y --no-install-recommends \
        libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copy the pre-built virtual environment from the builder stage
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# ── Non-root User ─────────────────────────────────────────────────
# Running as root inside a container is a security risk.
# We create a dedicated system user 'appuser' and run as them.
RUN addgroup --system appgroup && \
    adduser --system --ingroup appgroup --no-create-home appuser

# Copy application source code
COPY . .

# Give the non-root user ownership of the app directory
RUN chown -R appuser:appgroup /app

# Make the entrypoint script executable
RUN chmod +x entrypoint.sh

# Switch to non-root user for all subsequent commands
USER appuser

# Document the port the app listens on (informational)
EXPOSE 8000

# Start via the entrypoint script (runs migrations → starts gunicorn)
ENTRYPOINT ["./entrypoint.sh"]
