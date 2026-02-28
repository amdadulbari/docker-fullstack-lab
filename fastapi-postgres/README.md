# FastAPI + PostgreSQL — Books API

A beginner-friendly but production-structured async REST API built with FastAPI, async SQLAlchemy 2.0, and PostgreSQL. Demonstrates Dependency Injection, Pydantic v2 validation, lifespan events, auto-generated API docs, and full CRUD.

---

## 1. Project Overview

A **Books API** where you can manage a catalog of books. Each book has a title, author, description, published year, and availability flag.

**What makes FastAPI special:**
- Auto-generates interactive Swagger docs at `/docs`
- Async from the ground up — handles many concurrent requests without blocking
- Pydantic validates every request automatically — no manual validation code
- Type hints everywhere — great IDE support and self-documenting code

---

## 2. Tech Stack

| Layer          | Technology                          |
|----------------|-------------------------------------|
| Language       | Python 3.12                         |
| Framework      | FastAPI 0.110                       |
| ORM            | SQLAlchemy 2.0 (async)              |
| DB Driver      | asyncpg                             |
| Database       | PostgreSQL 16                       |
| WSGI/ASGI      | Gunicorn + Uvicorn workers          |
| Validation     | Pydantic v2                         |
| Config         | pydantic-settings                   |
| Container      | Docker + Docker Compose             |

---

## 3. Architecture Explanation

```
Client (curl / Postman / /docs UI)
         │
         ▼
   Gunicorn (process manager)
   └── Uvicorn workers (ASGI)         ← async event loop per worker
         │
         ▼
   FastAPI Application
   ├── app/main.py                    ← app instance, lifespan, router mounting
   ├── app/config.py                  ← settings from env vars (pydantic-settings)
   ├── app/database.py                ← async engine, session factory, get_db()
   ├── app/models.py                  ← SQLAlchemy ORM table definitions
   ├── app/schemas.py                 ← Pydantic request/response schemas
   └── app/routers/
       ├── health.py                  ← GET /health
       └── books.py                   ← CRUD routes
         │
         ▼
   PostgreSQL (asyncpg driver)
```

**Key design patterns:**
- **Dependency Injection**: `Depends(get_db)` injects a DB session per request — FastAPI manages the lifecycle
- **Schema separation**: ORM models ≠ API schemas (two different concerns)
- **Lifespan**: startup/shutdown logic in one place (`@asynccontextmanager`)
- **Computed settings**: `DATABASE_URL` assembled from individual parts so `DB_HOST` can differ per environment

---

## 4. Folder Structure

```
fastapi-postgres/
├── app/
│   ├── __init__.py
│   ├── main.py            ← FastAPI instance, lifespan, router registration
│   ├── config.py          ← All settings from environment variables
│   ├── database.py        ← Async SQLAlchemy engine, session, get_db dependency
│   ├── models.py          ← ORM models (SQLAlchemy 2.0 mapped_column style)
│   ├── schemas.py         ← Pydantic schemas: BookCreate, BookUpdate, BookResponse
│   └── routers/
│       ├── __init__.py
│       ├── health.py      ← GET /health
│       └── books.py       ← Full CRUD for books
│
├── requirements.txt
├── Dockerfile             ← Multi-stage build, non-root user
├── docker-compose.yml     ← web + db services, healthcheck, named volume
├── .env.example
├── .dockerignore
├── .gitignore
└── README.md
```

---

## 5. How to Run Locally (Without Docker)

### Prerequisites
- Python 3.12+
- PostgreSQL running locally

```bash
# 1. Clone the project
git clone <repo-url>
cd fastapi-postgres

# 2. Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate     # Windows: .venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment variables
cp .env.example .env
# Edit .env — set DB_HOST=localhost and your DB credentials

# 5. Run the development server (with auto-reload)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

App runs at: http://localhost:8000
Interactive docs: http://localhost:8000/docs

---

## 6. How to Run with Docker

```bash
# 1. Clone the project
git clone <repo-url>
cd fastapi-postgres

# 2. Create your environment file (defaults work out of the box)
cp .env.example .env

# 3. Build and start
docker compose up --build

# 4. Stop
docker compose down

# 5. Stop and wipe database
docker compose down -v
```

App runs at: http://localhost:8000
Interactive docs: http://localhost:8000/docs

---

## 7. API Endpoints

| Method | Endpoint                  | Description                        |
|--------|---------------------------|-------------------------------------|
| GET    | `/health`                 | App + database health check         |
| GET    | `/api/v1/books/`          | List all books (paginated)          |
| POST   | `/api/v1/books/`          | Create a new book                   |
| GET    | `/api/v1/books/{id}`      | Get a single book by ID             |
| PUT    | `/api/v1/books/{id}`      | Update one or more fields           |
| DELETE | `/api/v1/books/{id}`      | Delete a book (returns 204)         |

### Query Parameters

| Param   | Type | Default | Description              |
|---------|------|---------|--------------------------|
| `skip`  | int  | 0       | Records to skip          |
| `limit` | int  | 10      | Max records to return    |

---

## 8. Example curl Commands

```bash
# ── Health Check ──────────────────────────────────────────────
curl http://localhost:8000/health

# ── Create a Book ─────────────────────────────────────────────
curl -X POST http://localhost:8000/api/v1/books/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "description": "A handbook of agile software craftsmanship",
    "published_year": 2008,
    "available": true
  }'

# ── List All Books ────────────────────────────────────────────
curl http://localhost:8000/api/v1/books/

# ── Pagination ────────────────────────────────────────────────
curl "http://localhost:8000/api/v1/books/?skip=0&limit=5"

# ── Get a Single Book ─────────────────────────────────────────
curl http://localhost:8000/api/v1/books/1

# ── Update a Book (partial — only changed fields) ─────────────
curl -X PUT http://localhost:8000/api/v1/books/1 \
  -H "Content-Type: application/json" \
  -d '{"available": false}'

# ── Delete a Book ─────────────────────────────────────────────
curl -X DELETE http://localhost:8000/api/v1/books/1
```

### Example Responses

**GET /health**
```json
{
  "status": "ok",
  "database": "ok",
  "timestamp": "2024-01-15T10:30:00.123456+00:00"
}
```

**POST /api/v1/books/**
```json
{
  "id": 1,
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "description": "A handbook of agile software craftsmanship",
  "published_year": 2008,
  "available": true,
  "created_at": "2024-01-15T10:30:00.123456Z",
  "updated_at": null
}
```

**Validation Error (missing required field)**
```json
{
  "detail": [
    {
      "type": "missing",
      "loc": ["body", "author"],
      "msg": "Field required"
    }
  ]
}
```

---

## 9. Environment Variables

| Variable      | Required | Default   | Description                                    |
|---------------|----------|-----------|------------------------------------------------|
| `APP_NAME`    | No       | see below | Application name (shown in /docs)              |
| `APP_VERSION` | No       | `1.0.0`   | API version                                    |
| `DEBUG`       | No       | `False`   | Enables SQLAlchemy SQL logging                 |
| `DB_USER`     | Yes      | —         | PostgreSQL username                            |
| `DB_PASSWORD` | Yes      | —         | PostgreSQL password                            |
| `DB_NAME`     | Yes      | —         | PostgreSQL database name                       |
| `DB_HOST`     | No       | `db`      | `db` for Docker, `localhost` for local dev     |
| `DB_PORT`     | No       | `5432`    | PostgreSQL port                                |

> `DATABASE_URL` is **computed automatically** from the individual parts above. You don't set it manually.

---

## 10. Screenshots

> _Add screenshots of your running application here._

| View | Screenshot |
|------|------------|
| Swagger UI (`/docs`) | `[ screenshot ]` |
| Health check | `[ screenshot ]` |
| Book list | `[ screenshot ]` |
| Create book | `[ screenshot ]` |

---

## Key Concepts Demonstrated

| Concept | Where to find it |
|---------|-----------------|
| Async SQLAlchemy 2.0 | `app/database.py` + `app/routers/books.py` |
| Pydantic v2 schemas | `app/schemas.py` — BookCreate, BookUpdate, BookResponse |
| Dependency Injection | `Depends(get_db)` in every router function |
| Schema/Model separation | `models.py` (DB) vs `schemas.py` (API) |
| Lifespan events | `app/main.py` — `@asynccontextmanager` |
| Partial updates | `model_dump(exclude_unset=True)` in books.py |
| Auto API docs | Visit `/docs` (Swagger) or `/redoc` |
| Computed config field | `app/config.py` → `DATABASE_URL` property |
| Multi-stage Docker build | `Dockerfile` |
| Gunicorn + Uvicorn workers | `Dockerfile` CMD |
| Non-root container user | `Dockerfile` |

## Next Steps (Beyond This Demo)

- Add **Alembic** for proper database migrations (instead of `create_all`)
- Add **JWT authentication** with `python-jose`
- Add **pytest + httpx** for async testing
- Add **Redis caching** for frequently-read endpoints
