# Todo App — React + Express + PostgreSQL

A production-structured, full-stack Todo application demonstrating a modern
React (Vite) frontend, an Express REST API backend, and a PostgreSQL database,
all orchestrated with Docker Compose.

---

## 1. Project Overview

This project is a full-stack Todo App that lets you create, read, update, and
delete tasks.  It is intentionally simple in functionality but structured the
way a real production project would be:

- Clear separation between frontend and backend code.
- Versioned REST API (`/api/v1/todos`).
- Containerised services that can be started with a single command.
- Environment-variable-driven configuration (no hard-coded values).
- Self-bootstrapping database (the todos table is created on first startup).

---

## 2. Tech Stack

| Layer          | Technology                          | Notes                                  |
|----------------|-------------------------------------|----------------------------------------|
| Frontend       | React 18 + Vite 5                   | SPA, served by nginx in production     |
| HTTP client    | Axios 1.x                           | Centralised in `src/api/todoApi.js`    |
| Backend        | Node.js 20 + Express 4              | REST API, port 4000                    |
| Database       | PostgreSQL 16                       | Managed by Docker, port 5432           |
| DB client      | pg (node-postgres) with Pool        | Connection pooling, parameterised SQL  |
| Reverse proxy  | nginx (alpine)                      | Serves SPA + proxies `/api` to Express |
| Containerisation | Docker + Docker Compose           | Multi-stage builds, named volumes      |

---

## 3. Architecture

```
                    ┌──────────────────────────────────────────┐
                    │                Browser                    │
                    │  http://localhost:3000                    │
                    └───────────────────┬──────────────────────┘
                                        │ HTTP :80 (mapped to host :3000)
                    ┌───────────────────▼──────────────────────┐
                    │           nginx  (frontend container)     │
                    │                                           │
                    │  GET /         → serves React SPA         │
                    │  GET /api/**   → proxy_pass backend:4000  │
                    │  GET /health   → proxy_pass backend:4000  │
                    └───────────────────┬──────────────────────┘
                                        │ HTTP :4000 (internal Docker network)
                    ┌───────────────────▼──────────────────────┐
                    │         Express API  (backend container)  │
                    │                                           │
                    │  GET    /api/v1/todos                     │
                    │  POST   /api/v1/todos                     │
                    │  GET    /api/v1/todos/:id                 │
                    │  PUT    /api/v1/todos/:id                 │
                    │  DELETE /api/v1/todos/:id                 │
                    │  GET    /health                           │
                    └───────────────────┬──────────────────────┘
                                        │ TCP :5432 (internal Docker network)
                    ┌───────────────────▼──────────────────────┐
                    │       PostgreSQL 16  (db container)       │
                    │                                           │
                    │  Database : tododb                        │
                    │  Table    : todos                         │
                    └──────────────────────────────────────────┘
```

**Separation of concerns:**

- The **browser** only ever talks to nginx on port 3000.  It never connects
  directly to the backend or the database.
- **nginx** handles two jobs: serving the pre-built React bundle as static files,
  and forwarding `/api` and `/health` requests to Express.  This avoids any
  browser CORS issues and keeps the origin consistent.
- **Express** is the only service that opens a connection to PostgreSQL.
  It validates input, executes parameterised SQL, and returns JSON.
- **PostgreSQL** never needs to be reachable from outside the Docker network
  except for optional direct inspection via `psql`.

---

## 4. Folder Structure

```
react-node/
├── backend/                  Express API
│   ├── src/
│   │   ├── config/db.js      PostgreSQL pool + initDb()
│   │   ├── controllers/      One controller per resource
│   │   ├── routes/           Express routers (health + todos)
│   │   └── app.js            Middleware, route mounting, error handlers
│   ├── server.js             Entry point: loads .env, calls initDb, listens
│   ├── package.json
│   └── Dockerfile            Multi-stage: deps → production
│
├── frontend/                 React SPA (Vite)
│   ├── src/
│   │   ├── api/todoApi.js    All Axios calls in one place
│   │   ├── components/       TodoForm, TodoList, TodoItem
│   │   ├── App.jsx           Root component (state, handlers)
│   │   ├── App.css           Plain CSS — no external library
│   │   └── main.jsx          React 18 createRoot entry point
│   ├── index.html            Vite HTML template
│   ├── vite.config.js        Dev proxy + build config
│   ├── package.json
│   └── Dockerfile            Multi-stage: builder (Vite) → nginx
│
├── docker-compose.yml        Orchestrates db + backend + frontend
├── .env.example              Template — copy to .env before running
├── .gitignore
└── README.md
```

**Why this monorepo layout?**

Keeping `backend/` and `frontend/` as siblings in one repository means:

- A single `git clone` gives a developer everything they need.
- Docker Compose can build both images from one `docker compose up --build`.
- Shared configuration (`.env`, `.gitignore`) lives at the root, avoiding duplication.
- Each sub-project is still independently deployable — CI can build and push
  `backend` and `frontend` Docker images separately.

---

## 5. Local Development Without Docker

### Prerequisites

- Node.js 20+
- PostgreSQL 16 running locally (or via `docker run postgres:16-alpine`)

### Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env (edit DB_* values to match your local PostgreSQL)
cp ../.env.example .env
# Set DB_HOST=localhost in .env

# Start the development server (hot-reloads with nodemon)
npm run dev
# API is available at http://localhost:4000
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Edit vite.config.js proxy target if backend is not on localhost:4000
# The default proxy target is http://backend:4000 — change to http://localhost:4000
# for local dev.

# Start the Vite development server
npm run dev
# App is available at http://localhost:3000
```

Vite's dev proxy forwards `/api` and `/health` requests to the backend, so no
CORS configuration is needed during development.

---

## 6. Docker Setup

```bash
# 1. Copy the environment template
cp .env.example .env

# 2. (Optional) Change DB_PASSWORD and FRONTEND_URL in .env

# 3. Build images and start all three services
docker compose up --build

# 4. Open the app
open http://localhost:3000

# 5. Stop and remove containers (data persists in the named volume)
docker compose down

# 6. Remove everything including the database volume
docker compose down -v
```

To rebuild only one service after a code change:

```bash
docker compose up --build backend
docker compose up --build frontend
```

View logs for a specific service:

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

---

## 7. API Endpoints

All endpoints are prefixed with `/api/v1`.

| Method   | Path             | Description                               | Request body                          | Success |
|----------|------------------|-------------------------------------------|---------------------------------------|---------|
| `GET`    | `/todos`         | List all todos, newest first              | —                                     | 200     |
| `POST`   | `/todos`         | Create a new todo                         | `{ "title": "string" }`               | 201     |
| `GET`    | `/todos/:id`     | Fetch a single todo by id                 | —                                     | 200     |
| `PUT`    | `/todos/:id`     | Update title and/or completed flag        | `{ "title"?: "string", "completed"?: bool }` | 200 |
| `DELETE` | `/todos/:id`     | Delete a todo (idempotent)                | —                                     | 200     |
| `GET`    | `/health`        | Liveness / readiness probe                | —                                     | 200     |

**Successful list response:**
```json
{
  "count": 2,
  "todos": [
    {
      "id": 2,
      "title": "Buy groceries",
      "completed": false,
      "created_at": "2025-01-15T10:30:00.000Z",
      "updated_at": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

**Health response:**
```json
{ "status": "ok", "database": "ok", "timestamp": "2025-01-15T10:30:00.000Z" }
```

---

## 8. curl Examples

```bash
# Health check
curl http://localhost:4000/health

# List all todos
curl http://localhost:4000/api/v1/todos

# Create a todo
curl -X POST http://localhost:4000/api/v1/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Write documentation"}'

# Get a single todo (replace 1 with a real id)
curl http://localhost:4000/api/v1/todos/1

# Mark a todo as completed
curl -X PUT http://localhost:4000/api/v1/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# Update title only
curl -X PUT http://localhost:4000/api/v1/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "Write better documentation"}'

# Delete a todo
curl -X DELETE http://localhost:4000/api/v1/todos/1
```

---

## 9. Environment Variables

### Backend

| Variable        | Default         | Description                                     |
|-----------------|-----------------|-------------------------------------------------|
| `PORT`          | `4000`          | Port the Express server listens on              |
| `DB_HOST`       | `localhost`     | PostgreSQL host (`db` when using Docker Compose)|
| `DB_PORT`       | `5432`          | PostgreSQL port                                 |
| `DB_NAME`       | `tododb`        | Database name                                   |
| `DB_USER`       | `todouser`      | Database user                                   |
| `DB_PASSWORD`   | `todopassword`  | Database password                               |
| `FRONTEND_URL`  | `*`             | CORS allowed origin                             |
| `NODE_ENV`      | `development`   | Set to `production` in Docker Compose           |

### Frontend (Vite build-time — must be prefixed with `VITE_`)

| Variable        | Default    | Description                                           |
|-----------------|------------|-------------------------------------------------------|
| `VITE_API_URL`  | `/api/v1`  | Base URL for Axios. `/api/v1` uses the nginx proxy.   |

> **Note:** Vite inlines `VITE_*` variables into the JavaScript bundle at build
> time.  Changing them requires a rebuild (`npm run build` or `docker compose up --build frontend`).

---

## 10. Key Concepts

### CORS (Cross-Origin Resource Sharing)
Browsers block cross-origin requests unless the server explicitly permits them
via `Access-Control-Allow-Origin` headers.  The Express backend uses the `cors`
package configured with `FRONTEND_URL` so only the legitimate frontend origin
can call the API.  In the Docker setup this is not needed because nginx acts as
a reverse proxy, making all requests appear same-origin to the browser.

### Vite Proxy
During local development the Vite dev server proxies any request starting with
`/api` or `/health` to `http://backend:4000`.  This means the browser always
talks to `localhost:3000` (no cross-origin issue) and Vite silently forwards
the request to Express.  The proxy configuration lives in `vite.config.js`.

### nginx SPA Routing
React Router (or any client-side router) uses the HTML5 History API to change
the URL without triggering a real HTTP request.  When a user refreshes the
browser on a deep link like `/todos/42`, nginx would return 404 by default
because no static file exists at that path.  The `try_files $uri $uri/ /index.html`
directive tells nginx to always fall back to `index.html`, letting React handle
the route client-side.

### React Controlled Components
A controlled component is a form element whose value is managed by React state.
The component re-renders on every keystroke, keeping React as the single source
of truth.  This enables real-time validation, conditional button disabling, and
deterministic input clearing after form submission.  See `TodoForm.jsx`.

### Connection Pooling
Opening a new database connection per HTTP request is expensive (TCP handshake,
TLS, PostgreSQL authentication).  `pg.Pool` maintains a set of pre-opened
connections that are reused across requests.  Under concurrent load, multiple
requests execute queries simultaneously on different connections from the pool
rather than waiting in a queue.  See `src/config/db.js` for the full explanation.

---

## 11. Screenshots

_Screenshots placeholder — run the app and add images here._

```
docker compose up --build
open http://localhost:3000
```

Expected UI:

- A centered card with a text input and "Add Todo" button at the top.
- Each todo displays a checkbox, the title, and a delete button.
- Completed todos are struck through.
- The footer shows the total todo count.
