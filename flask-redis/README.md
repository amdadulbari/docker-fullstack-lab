# Flask + Redis — Notes API

A beginner-friendly but production-structured REST API built with Flask and Redis. Demonstrates the App Factory pattern, Blueprints, environment variables, Redis as a primary data store (using Hashes + Sets), and a health check endpoint.

> **Why Redis as a data store?**
> Redis is typically used for caching, but it's also a powerful primary store for simple, fast, schema-less data — sessions, counters, leaderboards, and short-lived records. This project shows you the patterns without needing SQL.

---

## 1. Project Overview

A simple **Notes API** where every note is stored as a Redis Hash. You can create, read, update, and delete notes. All data persists across container restarts via Redis AOF (Append-Only File) persistence.

---

## 2. Tech Stack

| Layer       | Technology                  |
|-------------|-----------------------------|
| Language    | Python 3.12                 |
| Framework   | Flask 3                     |
| Data Store  | Redis 7                     |
| Redis Client| redis-py                    |
| WSGI Server | Gunicorn                    |
| Container   | Docker + Docker Compose     |
| Config      | python-decouple (env vars)  |

---

## 3. Architecture Explanation

```
Client (curl / Postman / Browser)
         │
         ▼
   Gunicorn (WSGI Server)              ← production HTTP server
         │
         ▼
   Flask Application (App Factory)
   ├── wsgi.py                         ← Gunicorn entry point
   ├── app/__init__.py                 ← create_app() factory + blueprint registration
   ├── app/config.py                   ← all config from env vars
   ├── app/extensions.py               ← shared Redis client
   └── app/routes/
       ├── health.py                   ← GET /health
       └── notes.py                    ← CRUD routes for notes
                │
                ▼
         Redis (via redis-py)          ← fast in-memory data store with persistence
```

**Redis data layout:**
```
notes:ids          →  Redis SET   — holds all note UUIDs
note:{uuid}        →  Redis HASH  — id, title, content, created_at, updated_at
```

**Request flow:**
1. Gunicorn receives the HTTP request and passes it to Flask
2. Flask routes the request to the correct Blueprint function
3. The view reads/writes Redis directly via the shared `redis_client`
4. Flask serializes the response to JSON

---

## 4. Folder Structure

```
flask-redis/
├── app/                             # Flask application package
│   ├── __init__.py                  # App Factory: create_app()
│   ├── config.py                    # Configuration from environment variables
│   ├── extensions.py                # Redis client (shared singleton)
│   └── routes/
│       ├── __init__.py
│       ├── health.py                # GET /health — pings Redis
│       └── notes.py                 # Full CRUD for notes stored in Redis
│
├── wsgi.py                          # Gunicorn entry point (production)
├── run.py                           # Flask dev server (local only)
├── requirements.txt                 # Python dependencies
├── Dockerfile                       # Multi-stage build, non-root user
├── docker-compose.yml               # Orchestrates web + redis containers
├── .env.example                     # Template for environment variables
├── .dockerignore                    # Files excluded from Docker build
├── .gitignore                       # Files excluded from git
└── README.md
```

---

## 5. How to Run Locally (Without Docker)

### Prerequisites
- Python 3.12+
- Redis server running locally (`redis-server`)

### Steps

```bash
# 1. Clone the project
git clone <repo-url>
cd flask-redis

# 2. Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate     # Windows: .venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment variables
cp .env.example .env
# Edit .env — set REDIS_HOST=localhost

# 5. Start the development server
python run.py
```

App runs at: http://localhost:5000

---

## 6. How to Run with Docker

### Prerequisites
- Docker Desktop (or Docker Engine + Docker Compose plugin)

### Steps

```bash
# 1. Clone the project
git clone <repo-url>
cd flask-redis

# 2. Create your environment file
cp .env.example .env

# 3. Build images and start all containers
docker compose up --build

# 4. Stop everything
docker compose down

# 5. Stop AND delete Redis data
docker compose down -v
```

App runs at: http://localhost:5000

---

## 7. API Endpoints

| Method | Endpoint                  | Description                    |
|--------|---------------------------|--------------------------------|
| GET    | `/health`                 | App + Redis health check       |
| GET    | `/api/v1/notes`           | List all notes (newest first)  |
| POST   | `/api/v1/notes`           | Create a new note              |
| GET    | `/api/v1/notes/<id>`      | Get a single note by UUID      |
| PUT    | `/api/v1/notes/<id>`      | Update a note's fields         |
| DELETE | `/api/v1/notes/<id>`      | Delete a note                  |

---

## 8. Example curl Commands

```bash
# ── Health Check ──────────────────────────────────────────────
curl http://localhost:5000/health

# ── Create a Note ─────────────────────────────────────────────
curl -X POST http://localhost:5000/api/v1/notes \
  -H "Content-Type: application/json" \
  -d '{"title": "Learn Redis", "content": "Study Hashes, Sets, and Lists"}'

# ── List All Notes ────────────────────────────────────────────
curl http://localhost:5000/api/v1/notes

# ── Get a Single Note ─────────────────────────────────────────
# Replace <id> with the UUID from the create response
curl http://localhost:5000/api/v1/notes/<id>

# ── Update a Note ─────────────────────────────────────────────
curl -X PUT http://localhost:5000/api/v1/notes/<id> \
  -H "Content-Type: application/json" \
  -d '{"title": "Learn Redis", "content": "Done! Hashes are great."}'

# ── Delete a Note ─────────────────────────────────────────────
curl -X DELETE http://localhost:5000/api/v1/notes/<id>
```

### Example Responses

**GET /health**
```json
{
  "status": "ok",
  "redis": "ok",
  "timestamp": "2024-01-15T10:30:00.123456+00:00"
}
```

**POST /api/v1/notes**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Learn Redis",
  "content": "Study Hashes, Sets, and Lists",
  "created_at": "2024-01-15T10:30:00.123456+00:00",
  "updated_at": "2024-01-15T10:30:00.123456+00:00"
}
```

**GET /api/v1/notes**
```json
{
  "count": 2,
  "notes": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "Second note",
      "content": "...",
      "created_at": "2024-01-15T11:00:00+00:00",
      "updated_at": "2024-01-15T11:00:00+00:00"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Learn Redis",
      "content": "Study Hashes, Sets, and Lists",
      "created_at": "2024-01-15T10:30:00+00:00",
      "updated_at": "2024-01-15T10:30:00+00:00"
    }
  ]
}
```

---

## 9. Environment Variables

| Variable         | Required | Default       | Description                                         |
|------------------|----------|---------------|-----------------------------------------------------|
| `SECRET_KEY`     | Yes      | —             | Flask secret key (used for sessions & signing)      |
| `DEBUG`          | No       | `False`       | Enable Flask debug mode (`True` for dev only)       |
| `REDIS_HOST`     | No       | `redis`       | Redis hostname (`redis` for Docker, `localhost` local) |
| `REDIS_PORT`     | No       | `6379`        | Redis port                                          |
| `REDIS_DB`       | No       | `0`           | Redis logical database index (0–15)                 |
| `REDIS_PASSWORD` | No       | *(empty)*     | Redis auth password; leave blank to disable auth    |

---

## 10. Screenshots

> _Add screenshots of your running application here._

| Endpoint | Screenshot |
|----------|------------|
| Health Check | `[ screenshot ]` |
| Note List | `[ screenshot ]` |
| Create Note | `[ screenshot ]` |

---

## Key Concepts Demonstrated

| Concept | Where to find it |
|---------|-----------------|
| App Factory Pattern | `app/__init__.py` → `create_app()` |
| Flask Blueprints | `app/routes/health.py`, `app/routes/notes.py` |
| Redis Hash (HSET/HGETALL) | `notes.py` — storing note fields |
| Redis Set (SADD/SMEMBERS) | `notes.py` — tracking all note IDs |
| Environment variables | `app/config.py` + `app/extensions.py` |
| Shared Redis client | `app/extensions.py` — one connection pool |
| Multi-stage Docker build | `Dockerfile` |
| Non-root container user | `Dockerfile` |
| Redis AOF persistence | `docker-compose.yml` → `--appendonly yes` |
| Redis health check | `docker-compose.yml` → `healthcheck: redis-cli ping` |
| Data persists on restart | `docker-compose.yml` → named volume `redis_data` |
