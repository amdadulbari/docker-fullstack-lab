# ════════════════════════════════════════════════════════════════
# Dockerfile — Flask + Redis
# Multi-stage build:
#   Stage 1 (builder)    → installs Python deps into a virtual env
#   Stage 2 (production) → copies only the venv + app, runs as non-root
# ════════════════════════════════════════════════════════════════

# ── Stage 1: Builder ─────────────────────────────────────────────
FROM python:3.12-slim AS builder

WORKDIR /app

# No system build deps needed for this stack (redis-py is pure Python)
# If you add psycopg2 later, you'd add gcc + libpq-dev here

# Create an isolated virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install dependencies (layer is cached unless requirements.txt changes)
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt


# ── Stage 2: Production ───────────────────────────────────────────
FROM python:3.12-slim AS production

WORKDIR /app

# Copy the pre-built venv from the builder stage
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# ── Non-root User ─────────────────────────────────────────────────
# Running as root inside containers is a security anti-pattern.
RUN addgroup --system appgroup && \
    adduser  --system --ingroup appgroup --no-create-home appuser

# Copy application source code
COPY . .

# Give ownership to the non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Document the port (informational — docker-compose actually publishes it)
EXPOSE 5000

# Launch Gunicorn using wsgi.py as the entry point
# --workers 3 → good starting point for CPU-bound workloads
# --access-logfile - → stream access logs to stdout (Docker captures these)
CMD ["gunicorn", "wsgi:app", \
     "--bind", "0.0.0.0:5000", \
     "--workers", "3", \
     "--timeout", "120", \
     "--access-logfile", "-", \
     "--error-logfile", "-"]
