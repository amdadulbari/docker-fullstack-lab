"""
ORM Models — app/models.py
───────────────────────────
Defines the database schema using SQLAlchemy's declarative ORM.
Each Python class maps to a database table.

FastAPI itself doesn't know about these — they're only used by
the database layer. Pydantic schemas (schemas.py) handle the API layer.
"""

from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Book(Base):
    """
    Represents a book in the database.

    SQLAlchemy 2.0 style uses Mapped[] type hints and mapped_column()
    instead of Column(). This gives better type safety and IDE support.

    Table name: books (auto-derived from class name, snake-cased)
    """

    __tablename__ = "books"

    # ── Primary Key ───────────────────────────────────────────────
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    # ── Fields ────────────────────────────────────────────────────
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    author: Mapped[str] = mapped_column(String(255), nullable=False, index=True)

    # Text() = unlimited length; nullable means optional
    description: Mapped[str | None] = mapped_column(Text, nullable=True, default="")

    published_year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    available: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # ── Timestamps (set by the database, not Python) ──────────────
    # func.now() → calls PostgreSQL's NOW() on insert/update
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        onupdate=func.now(),   # auto-updated by SQLAlchemy on every UPDATE
        nullable=True,
    )

    def __repr__(self) -> str:
        return f"<Book id={self.id} title='{self.title}' author='{self.author}'>"
