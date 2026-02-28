# ════════════════════════════════════════════════════════════════
# Dockerfile — FastAPI + PostgreSQL
# Multi-stage build:
#   Stage 1 (builder)    → installs Python deps into a venv
#   Stage 2 (production) → copies only the venv + app, runs as non-root
# ════════════════════════════════════════════════════════════════

# ── Stage 1: Builder ─────────────────────────────────────────────
FROM python:3.13-slim AS builder

WORKDIR /app

# asyncpg compiles C extensions — we need gcc for that
RUN apt-get update && apt-get install -y --no-install-recommends \
        gcc \
        python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Isolated virtual environment for clean layer separation
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .
# hadolint ignore=DL3013
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt


# ── Stage 2: Production ───────────────────────────────────────────
FROM python:3.13-slim AS production

WORKDIR /app

# Copy only the pre-built venv (no gcc, no build tools)
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# ── Non-root User ─────────────────────────────────────────────────
RUN addgroup --system appgroup && \
    adduser  --system --ingroup appgroup --no-create-home appuser

COPY . .
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 8000

# Production command:
#   gunicorn → manages multiple processes
#   UvicornWorker → each process is an async ASGI worker (required for FastAPI)
CMD ["gunicorn", "app.main:app", \
     "--worker-class", "uvicorn.workers.UvicornWorker", \
     "--bind", "0.0.0.0:8000", \
     "--workers", "3", \
     "--timeout", "120", \
     "--access-logfile", "-", \
     "--error-logfile", "-"]
