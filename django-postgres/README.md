# Django + PostgreSQL — Task Manager API

A beginner-friendly but production-structured REST API built with Django, Django REST Framework, and PostgreSQL. Demonstrates routing, environment variables, database integration, full CRUD operations, and a health check endpoint.

---

## 1. Project Overview

A simple **Task Manager API** that lets you create, read, update, and delete tasks. Each task has a title, description, and a completion flag.

This project is intentionally minimal in business logic so you can focus on understanding the **architecture and patterns** used in real Django applications.

---

## 2. Tech Stack

| Layer       | Technology                         |
|-------------|-------------------------------------|
| Language    | Python 3.12                         |
| Framework   | Django 5 + Django REST Framework    |
| Database    | PostgreSQL 16                       |
| WSGI Server | Gunicorn                            |
| Container   | Docker + Docker Compose             |
| Config      | python-decouple (env vars)          |

---

## 3. Architecture Explanation

```
Client (curl / Postman / Browser)
         │
         ▼
   Gunicorn (WSGI Server)          ← production HTTP server
         │
         ▼
   Django Application
   ├── core/urls.py                ← root URL router
   ├── tasks/urls.py               ← task-specific routes (via DRF Router)
   ├── tasks/views.py              ← business logic (ViewSet + health check)
   ├── tasks/serializers.py        ← JSON ↔ Python model conversion
   └── tasks/models.py             ← database schema (ORM)
         │
         ▼
   PostgreSQL (via psycopg2)       ← persistent data storage
```

**Request flow:**
1. Gunicorn receives an HTTP request and passes it to Django
2. Django's URL router matches the path to a view
3. The view uses the serializer to validate/parse JSON
4. The serializer talks to the model (ORM) which queries PostgreSQL
5. The response is serialized to JSON and returned

---

## 4. Folder Structure

```
django-postgres/
├── core/                        # Django project package (settings, root URLs)
│   ├── __init__.py
│   ├── settings.py              # All project settings, env-var driven
│   ├── urls.py                  # Root URL configuration
│   ├── wsgi.py                  # WSGI entry point (Gunicorn uses this)
│   └── asgi.py                  # ASGI entry point (for async servers)
│
├── tasks/                       # "tasks" Django app — all CRUD logic lives here
│   ├── __init__.py
│   ├── admin.py                 # Django admin registration
│   ├── apps.py                  # App configuration
│   ├── models.py                # Task database model
│   ├── serializers.py           # JSON ↔ model conversion
│   ├── urls.py                  # App-level URL routing (DRF Router)
│   └── views.py                 # API views (ViewSet + health check)
│
├── manage.py                    # Django management CLI entry point
├── requirements.txt             # Python dependencies
├── entrypoint.sh                # Docker entrypoint: migrate → start gunicorn
├── Dockerfile                   # Multi-stage Docker build
├── docker-compose.yml           # Orchestrates web + db containers
├── .env.example                 # Template for environment variables
├── .dockerignore                # Files excluded from Docker build context
├── .gitignore                   # Files excluded from git
└── README.md                    # This file
```

---

## 5. How to Run Locally (Without Docker)

### Prerequisites
- Python 3.12+
- PostgreSQL running locally
- A database and user created in PostgreSQL

### Steps

```bash
# 1. Clone the project
git clone <repo-url>
cd django-postgres

# 2. Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate          # On Windows: .venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment variables
cp .env.example .env
# Edit .env — set DB_HOST=localhost and your DB credentials

# 5. Apply database migrations
python manage.py migrate

# 6. (Optional) Create a Django admin superuser
python manage.py createsuperuser

# 7. Start the development server
python manage.py runserver
```

App runs at: http://localhost:8000

---

## 6. How to Run with Docker

### Prerequisites
- Docker Desktop (or Docker Engine + Docker Compose plugin)

### Steps

```bash
# 1. Clone the project
git clone <repo-url>
cd django-postgres

# 2. Create your environment file
cp .env.example .env
# Edit .env if needed (defaults work out of the box)

# 3. Build images and start all containers
docker compose up --build

# 4. (In a new terminal) Create a superuser for admin access
docker compose exec web python manage.py createsuperuser

# 5. Stop everything
docker compose down

# 6. Stop AND delete database data
docker compose down -v
```

App runs at: http://localhost:8000
Django Admin: http://localhost:8000/admin/

---

## 7. API Endpoints

| Method | Endpoint                | Description              |
|--------|-------------------------|--------------------------|
| GET    | `/health`               | App + database health    |
| GET    | `/api/v1/tasks/`        | List all tasks (paginated)|
| POST   | `/api/v1/tasks/`        | Create a new task        |
| GET    | `/api/v1/tasks/<id>/`   | Get a single task        |
| PUT    | `/api/v1/tasks/<id>/`   | Replace a task fully     |
| PATCH  | `/api/v1/tasks/<id>/`   | Partially update a task  |
| DELETE | `/api/v1/tasks/<id>/`   | Delete a task            |

### Query Parameters

| Parameter   | Type    | Example                             | Description                |
|-------------|---------|-------------------------------------|----------------------------|
| `completed` | boolean | `/api/v1/tasks/?completed=true`     | Filter by completion status|
| `page`      | integer | `/api/v1/tasks/?page=2`             | Pagination (10 per page)   |

---

## 8. Example curl Commands

```bash
# ── Health Check ──────────────────────────────────────────────
curl http://localhost:8000/health

# ── Create a Task ─────────────────────────────────────────────
curl -X POST http://localhost:8000/api/v1/tasks/ \
  -H "Content-Type: application/json" \
  -d '{"title": "Learn Django", "description": "Study models, views, and URLs"}'

# ── List All Tasks ────────────────────────────────────────────
curl http://localhost:8000/api/v1/tasks/

# ── Get a Single Task ─────────────────────────────────────────
curl http://localhost:8000/api/v1/tasks/1/

# ── Update a Task (full replace) ──────────────────────────────
curl -X PUT http://localhost:8000/api/v1/tasks/1/ \
  -H "Content-Type: application/json" \
  -d '{"title": "Learn Django", "description": "Done!", "completed": true}'

# ── Partial Update (mark as complete only) ────────────────────
curl -X PATCH http://localhost:8000/api/v1/tasks/1/ \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# ── Delete a Task ─────────────────────────────────────────────
curl -X DELETE http://localhost:8000/api/v1/tasks/1/

# ── Filter: Only Incomplete Tasks ─────────────────────────────
curl "http://localhost:8000/api/v1/tasks/?completed=false"
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

**POST /api/v1/tasks/**
```json
{
  "id": 1,
  "title": "Learn Django",
  "description": "Study models, views, and URLs",
  "completed": false,
  "created_at": "2024-01-15T10:30:00.123456Z",
  "updated_at": "2024-01-15T10:30:00.123456Z"
}
```

**GET /api/v1/tasks/**
```json
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 2,
      "title": "Deploy to production",
      "description": "",
      "completed": false,
      "created_at": "2024-01-15T11:00:00Z",
      "updated_at": "2024-01-15T11:00:00Z"
    },
    {
      "id": 1,
      "title": "Learn Django",
      "description": "Study models, views, and URLs",
      "completed": true,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:45:00Z"
    }
  ]
}
```

---

## 9. Environment Variables

| Variable        | Required | Default          | Description                                      |
|-----------------|----------|------------------|--------------------------------------------------|
| `SECRET_KEY`    | Yes      | —                | Django secret key (generate a unique one!)       |
| `DEBUG`         | No       | `False`          | Enable Django debug mode (`True` for dev only)   |
| `ALLOWED_HOSTS` | No       | `localhost,...`  | Comma-separated list of allowed hostnames        |
| `DB_NAME`       | Yes      | —                | PostgreSQL database name                         |
| `DB_USER`       | Yes      | —                | PostgreSQL username                              |
| `DB_PASSWORD`   | Yes      | —                | PostgreSQL password                              |
| `DB_HOST`       | No       | `db`             | DB hostname (`db` for Docker, `localhost` locally)|
| `DB_PORT`       | No       | `5432`           | PostgreSQL port                                  |

> **Generate a SECRET_KEY:**
> ```bash
> python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
> ```

---

## 10. Screenshots

> _Add screenshots of your running application here._

| Endpoint | Screenshot |
|----------|------------|
| Health Check | `[ screenshot ]` |
| Task List | `[ screenshot ]` |
| Create Task (Postman) | `[ screenshot ]` |
| Django Admin | `[ screenshot ]` |

---

## Key Concepts Demonstrated

| Concept | Where to find it |
|---------|-----------------|
| Django ORM / Models | `tasks/models.py` |
| DRF Serializers | `tasks/serializers.py` |
| ViewSets (auto CRUD) | `tasks/views.py` |
| DRF Router (auto URLs) | `tasks/urls.py` |
| Environment variables | `core/settings.py` + `.env.example` |
| Multi-stage Docker build | `Dockerfile` |
| Non-root container user | `Dockerfile` |
| Health check endpoint | `tasks/views.py` → `health_check()` |
| Docker service health | `docker-compose.yml` → `healthcheck:` |
| DB persistence | `docker-compose.yml` → named volume |
