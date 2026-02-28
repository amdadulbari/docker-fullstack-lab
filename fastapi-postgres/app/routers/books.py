"""
Books Router — app/routers/books.py
──────────────────────────────────────
Full CRUD for the Book resource, backed by PostgreSQL via async SQLAlchemy.

FastAPI key concepts used here:
  - APIRouter    → groups related routes (like Flask Blueprints)
  - Depends()    → Dependency Injection (get_db, etc.)
  - response_model → tells FastAPI which schema to use for the response
  - status_code  → default HTTP status code for the route
  - HTTPException → raises HTTP errors (404, etc.) with proper JSON bodies

All functions are 'async def' — they yield control to the event loop
while waiting for database I/O, making the server non-blocking.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Book
from app.schemas import BookCreate, BookResponse, BookUpdate

# APIRouter groups these endpoints under the /api/v1/books prefix
# (the prefix is added when the router is included in main.py)
router = APIRouter(prefix="/books", tags=["books"])


# ── List All Books ─────────────────────────────────────────────────
@router.get(
    "/",
    response_model=list[BookResponse],
    summary="List all books",
)
async def list_books(
    skip:  int = 0,
    limit: int = 10,
    db:    AsyncSession = Depends(get_db),
):
    """
    Returns a paginated list of all books, newest first.

    - **skip**: number of records to skip (for pagination)
    - **limit**: maximum number of records to return
    """
    result = await db.execute(
        select(Book)
        .order_by(Book.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


# ── Create a Book ──────────────────────────────────────────────────
@router.post(
    "/",
    response_model=BookResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a book",
)
async def create_book(
    book_in: BookCreate,             # FastAPI parses + validates the JSON body
    db:      AsyncSession = Depends(get_db),
):
    """
    Creates a new book. Returns the created book with its generated id and timestamps.
    """
    # model_dump() converts the Pydantic schema into a plain dict
    db_book = Book(**book_in.model_dump())

    db.add(db_book)
    await db.commit()

    # refresh() re-reads the row from the DB so we get server-generated
    # values like id, created_at, updated_at
    await db.refresh(db_book)

    return db_book


# ── Get a Single Book ──────────────────────────────────────────────
@router.get(
    "/{book_id}",
    response_model=BookResponse,
    summary="Get a book by ID",
)
async def get_book(
    book_id: int,
    db:      AsyncSession = Depends(get_db),
):
    """
    Returns a single book by its integer ID.
    Raises **404** if no book with that ID exists.
    """
    # db.get() is the fastest way to fetch by primary key
    book = await db.get(Book, book_id)

    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Book with id={book_id} not found",
        )

    return book


# ── Update a Book ──────────────────────────────────────────────────
@router.put(
    "/{book_id}",
    response_model=BookResponse,
    summary="Update a book",
)
async def update_book(
    book_id:  int,
    book_in:  BookUpdate,
    db:       AsyncSession = Depends(get_db),
):
    """
    Updates one or more fields of an existing book.
    Only the fields included in the request body are updated.
    """
    book = await db.get(Book, book_id)

    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Book with id={book_id} not found",
        )

    # exclude_unset=True → only process fields the client actually sent
    # This enables partial updates without the client sending all fields
    update_data = book_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(book, field, value)

    await db.commit()
    await db.refresh(book)

    return book


# ── Delete a Book ──────────────────────────────────────────────────
@router.delete(
    "/{book_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a book",
)
async def delete_book(
    book_id: int,
    db:      AsyncSession = Depends(get_db),
):
    """
    Permanently deletes a book by ID.
    Returns **204 No Content** on success (no response body).
    """
    book = await db.get(Book, book_id)

    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Book with id={book_id} not found",
        )

    await db.delete(book)
    await db.commit()
