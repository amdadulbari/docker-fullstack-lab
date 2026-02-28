"""
Health Router — app/routers/health.py
───────────────────────────────────────
GET /health

Checks both the app and the database connection.
Used by Docker healthcheck, Kubernetes liveness probes, and load balancers.

FastAPI Dependency Injection:
  'db: AsyncSession = Depends(get_db)' automatically calls get_db()
  and injects the resulting session. FastAPI handles cleanup after the response.
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db

router = APIRouter(tags=["health"])


@router.get("/health", summary="Health Check")
async def health_check(db: AsyncSession = Depends(get_db)):
    """
    Returns the health status of the app and the database connection.

    - **status**: 'ok' or 'error'
    - **database**: 'ok' or 'unreachable'
    - **timestamp**: current UTC time
    """
    try:
        # Execute a lightweight query to verify the DB connection is alive
        await db.execute(text("SELECT 1"))
        db_status = "ok"
    except Exception as exc:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "status":   "error",
                "database": "unreachable",
                "detail":   str(exc),
            },
        )

    return {
        "status":    "ok",
        "database":  db_status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
