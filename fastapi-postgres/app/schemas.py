"""
Pydantic Schemas — app/schemas.py
───────────────────────────────────
Schemas define the shape of data coming IN (request body) and going OUT (response).
They are completely separate from the ORM models — this is intentional:

  ORM Model  → defines the database table
  Schema     → defines the API contract (what the client sends/receives)

FastAPI uses schemas to:
  1. Validate and parse incoming request bodies automatically
  2. Serialize ORM objects into JSON responses
  3. Generate the OpenAPI documentation (/docs)

Three schemas per resource is a common pattern:
  BookCreate   → fields accepted when creating (no id, no timestamps)
  BookUpdate   → same fields but all optional (for partial updates)
  BookResponse → what we send back (includes id, timestamps)
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# ── Shared base ────────────────────────────────────────────────────
class BookBase(BaseModel):
    """Fields shared between create and response schemas."""

    title: str = Field(
        ...,                        # ... means required (no default)
        min_length=1,
        max_length=255,
        examples=["The Pragmatic Programmer"],
    )
    author: str = Field(
        ...,
        min_length=1,
        max_length=255,
        examples=["David Thomas"],
    )
    description: Optional[str] = Field(
        default="",
        examples=["A guide to becoming a better programmer"],
    )
    published_year: Optional[int] = Field(
        default=None,
        ge=1000,      # greater than or equal to 1000
        le=2100,      # less than or equal to 2100
        examples=[1999],
    )
    available: bool = Field(default=True)


# ── Create schema (used for POST body) ────────────────────────────
class BookCreate(BookBase):
    """
    Inherits all BookBase fields.
    No extra fields needed — id and timestamps are set by the database.
    """
    pass


# ── Update schema (used for PUT body) ─────────────────────────────
class BookUpdate(BaseModel):
    """
    All fields are Optional — clients can update any subset of fields.
    This enables true partial updates (PATCH-style behaviour via PUT).
    """
    title:          Optional[str] = Field(None, min_length=1, max_length=255)
    author:         Optional[str] = Field(None, min_length=1, max_length=255)
    description:    Optional[str] = None
    published_year: Optional[int] = Field(None, ge=1000, le=2100)
    available:      Optional[bool] = None


# ── Response schema (returned by every endpoint) ──────────────────
class BookResponse(BookBase):
    """
    Extends BookBase with database-generated fields.
    'from_attributes=True' allows Pydantic to read from ORM objects
    (it calls getattr() instead of dict access).
    """
    id:         int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
