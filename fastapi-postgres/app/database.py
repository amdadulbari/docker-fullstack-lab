"""
Database — app/database.py
───────────────────────────
Sets up the async SQLAlchemy engine and session factory.

Key concepts:
  - create_async_engine  → async connection to PostgreSQL via asyncpg
  - async_sessionmaker   → factory that creates AsyncSession objects
  - AsyncSession         → the async version of SQLAlchemy's Session
  - DeclarativeBase      → base class all ORM models inherit from
  - get_db()             → FastAPI dependency that provides a DB session per request
"""

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.config import settings


# ── Engine ─────────────────────────────────────────────────────────
# The engine manages the connection pool to PostgreSQL.
# echo=True logs every SQL statement (useful for debugging, disable in prod).
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,   # verify connections are alive before using them
)


# ── Session Factory ────────────────────────────────────────────────
# async_sessionmaker creates AsyncSession objects.
# expire_on_commit=False → objects remain accessible after commit (important for async).
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    expire_on_commit=False,
)


# ── Base Model Class ───────────────────────────────────────────────
# All ORM models (in models.py) inherit from this Base.
class Base(DeclarativeBase):
    pass


# ── Dependency: get_db ─────────────────────────────────────────────
# FastAPI's Dependency Injection system calls this per request.
# 'yield' turns it into a context manager:
#   - Code before yield  → runs before the route handler (opens session)
#   - Code after yield   → runs after the route handler (closes session)
async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session
