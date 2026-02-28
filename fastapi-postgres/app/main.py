"""
FastAPI Application — app/main.py
───────────────────────────────────
This is the core of the application. It:
  1. Creates the FastAPI instance
  2. Registers startup/shutdown logic via lifespan
  3. Attaches all routers (blueprints)

FastAPI auto-generates interactive API docs:
  - Swagger UI  → http://localhost:8000/docs
  - ReDoc       → http://localhost:8000/redoc
  - OpenAPI JSON → http://localhost:8000/openapi.json
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.config import settings
from app.database import Base, engine
from app.routers import books, health


# ── Lifespan (replaces deprecated @app.on_event) ──────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Runs code at startup and shutdown.

    Startup  → create all DB tables (if they don't exist yet)
    Shutdown → dispose the connection pool cleanly

    In production, use Alembic for migrations instead of create_all().
    create_all() is fine for development and demos.
    """
    # STARTUP
    async with engine.begin() as conn:
        # Creates all tables defined in models.py that don't exist yet.
        # Safe to call repeatedly — skips existing tables.
        await conn.run_sync(Base.metadata.create_all)

    yield   # ← the app runs here, handling requests

    # SHUTDOWN
    await engine.dispose()


# ── FastAPI App Instance ───────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "A simple Books API demonstrating FastAPI, async SQLAlchemy 2.0, "
        "PostgreSQL, Pydantic v2, Dependency Injection, and Docker."
    ),
    lifespan=lifespan,
)


# ── Mount Routers ──────────────────────────────────────────────────
# Health check at root level (no prefix) — easy for load balancers to hit
app.include_router(health.router)

# All book CRUD routes under /api/v1/books/
app.include_router(books.router, prefix="/api/v1")
