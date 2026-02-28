# Next.js 14 + PostgreSQL Blog App

## 1. Project Overview

A production-ready Blog application built with **Next.js 14 App Router**, demonstrating:

- **Server Components** for SSR page rendering — pages fetch data directly from PostgreSQL at request time, HTML is pre-rendered on the server and sent to the browser (great for SEO and performance).
- **Route Handlers** (API routes) for a complete REST API — `route.js` files in the `app/api/` directory handle HTTP methods (GET, POST, PUT, DELETE).
- **PostgreSQL** via `pg` (node-postgres) — a connection pool manages efficient database access across all requests.
- **Docker** with multi-stage builds and `output: 'standalone'` for a minimal production image.

---

## 2. Tech Stack

| Layer        | Technology                        | Version  |
|--------------|-----------------------------------|----------|
| Framework    | Next.js (App Router)              | 14.1.3   |
| UI Library   | React                             | 18.2.0   |
| Database     | PostgreSQL                        | 16       |
| DB Client    | pg (node-postgres)                | ^8.11.3  |
| Runtime      | Node.js                           | 20 LTS   |
| Container    | Docker + Docker Compose           | latest   |

---

## 3. Architecture

```
                    ┌─────────────────────────────────────────┐
                    │              Next.js Server              │
  Browser  ──────►  │                                         │
                    │  ┌──────────────────────────────────┐   │
  (HTML/CSS)  ◄───  │  │     Server Components (SSR)       │   │
                    │  │  page.jsx, posts/page.jsx         │   │
                    │  │  Fetch DB data directly at        │   │
                    │  │  request time, render HTML        │   │
                    │  └──────────────┬───────────────────┘   │
                    │                 │                        │
  API Client ─────► │  ┌──────────────▼───────────────────┐   │
  (curl/fetch)      │  │     Route Handlers (REST API)     │   │
             ◄───── │  │  /api/health  /api/posts          │   │  ──────► PostgreSQL
                    │  │  /api/posts/:id                   │   │           port 5432
                    │  └──────────────────────────────────┘   │
                    └─────────────────────────────────────────┘
```

**SSR vs CSR vs API Routes:**

- **Server Components (SSR):** `page.jsx` and `posts/page.jsx` run entirely on the server. They import `@/lib/posts` and query PostgreSQL directly — no `useEffect`, no `fetch('/api/...')`. The resulting HTML is streamed to the browser. Zero JavaScript sent to the client for these components.

- **Client-Side Rendering (CSR):** Not used in this app. Would require `'use client'` directive and `useState`/`useEffect` hooks to fetch data after page load.

- **Route Handlers (API):** `route.js` files export functions named after HTTP methods (`GET`, `POST`, `PUT`, `DELETE`). These become REST API endpoints, accessible from any HTTP client. They also run on the server and can access PostgreSQL.

---

## 4. Folder Structure

```
nextjs-postgres/
├── src/
│   ├── app/                          ← App Router root
│   │   ├── api/                      ← REST API endpoints
│   │   │   ├── health/
│   │   │   │   └── route.js          ← GET /api/health
│   │   │   └── posts/
│   │   │       ├── route.js          ← GET + POST /api/posts
│   │   │       └── [id]/
│   │   │           └── route.js      ← GET + PUT + DELETE /api/posts/:id
│   │   ├── posts/
│   │   │   └── page.jsx              ← /posts — Server Component (SSR)
│   │   ├── layout.jsx                ← Root layout, wraps all pages
│   │   ├── page.jsx                  ← / — Home page (Server Component)
│   │   └── globals.css               ← Global styles
│   └── lib/
│       ├── db.js                     ← pg Pool + query helper + initDb()
│       └── posts.js                  ← Data access functions (SQL queries)
├── package.json
├── next.config.mjs                   ← output: 'standalone' for Docker
├── Dockerfile                        ← Multi-stage production build
├── docker-compose.yml                ← Next.js + PostgreSQL services
├── .env.example                      ← Template for Docker (.env)
├── .env.local.example                ← Template for local dev (.env.local)
├── .dockerignore
├── .gitignore
└── README.md
```

**App Router Conventions:**
- `route.js` in a folder = API endpoint at that path
- `page.jsx` in a folder = UI page at that path
- `layout.jsx` = shared wrapper rendered around child pages
- `[id]/` folder = dynamic route segment (e.g., `/api/posts/42`)

---

## 5. Local Development Setup

**Prerequisites:** Node.js 20+, PostgreSQL running locally.

```bash
# 1. Clone and enter the project
git clone <repo-url>
cd nextjs-postgres

# 2. Set up environment variables for local dev
cp .env.local.example .env.local
# Edit .env.local — set DB_HOST=localhost and your PostgreSQL credentials

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The database table is created automatically on first request (`initDb()` in `layout.jsx`).

---

## 6. Docker Setup

**Prerequisites:** Docker and Docker Compose installed.

```bash
# 1. Copy environment file for Docker
cp .env.example .env
# Edit .env if you want custom credentials (DB_HOST must stay as 'db')

# 2. Build and start all services
docker compose up --build

# Run in background
docker compose up --build -d

# 3. Open the app
open http://localhost:3000

# Stop services
docker compose down

# Stop and remove volumes (wipes DB data)
docker compose down -v
```

Docker Compose starts two services:
- `db` — PostgreSQL 16 on port 5432
- `web` — Next.js app on port 3000 (waits for `db` health check)

---

## 7. API Endpoints

| Method | Endpoint          | Description              |
|--------|-------------------|--------------------------|
| GET    | `/api/health`     | Health check + DB status |
| GET    | `/api/posts`      | List all posts           |
| POST   | `/api/posts`      | Create a new post        |
| GET    | `/api/posts/:id`  | Get a single post        |
| PUT    | `/api/posts/:id`  | Update a post            |
| DELETE | `/api/posts/:id`  | Delete a post            |

---

## 8. curl Examples

```bash
# Health check
curl http://localhost:3000/api/health

# List all posts
curl http://localhost:3000/api/posts

# Create a post
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Post",
    "content": "This is the content of my first post.",
    "author": "Jane Doe",
    "published": true
  }'

# Create a draft post
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Work in Progress",
    "content": "Draft content here.",
    "published": false
  }'

# Get a single post (replace 1 with actual ID)
curl http://localhost:3000/api/posts/1

# Update a post
curl -X PUT http://localhost:3000/api/posts/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "published": true
  }'

# Delete a post
curl -X DELETE http://localhost:3000/api/posts/1
```

**Sample responses:**

```json
// POST /api/posts → 201 Created
{
  "id": 1,
  "title": "My First Post",
  "content": "This is the content of my first post.",
  "author": "Jane Doe",
  "published": true,
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}

// GET /api/posts → 200 OK
{
  "count": 2,
  "posts": [...]
}

// GET /api/health → 200 OK
{
  "status": "ok",
  "database": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 9. Environment Variables

| Variable      | Description                         | Default (Docker) | Default (Local) |
|---------------|-------------------------------------|------------------|-----------------|
| `DB_HOST`     | PostgreSQL hostname                 | `db`             | `localhost`     |
| `DB_PORT`     | PostgreSQL port                     | `5432`           | `5432`          |
| `DB_NAME`     | Database name                       | `blogdb`         | `blogdb`        |
| `DB_USER`     | Database user                       | `bloguser`       | `bloguser`      |
| `DB_PASSWORD` | Database password                   | `blogpassword`   | `blogpassword`  |

**File loading order in Next.js:**
- `.env.local` — local development overrides (git-ignored, highest priority)
- `.env` — used by Docker Compose (git-ignored)
- `.env.example` — committed template for Docker
- `.env.local.example` — committed template for local dev

---

## 10. Key Concepts

### App Router vs Pages Router

Next.js 14 uses the **App Router** (`src/app/`) instead of the older Pages Router (`pages/`). Key differences:

| Feature         | App Router (new)              | Pages Router (old)              |
|-----------------|-------------------------------|---------------------------------|
| API routes      | `app/api/.../route.js`        | `pages/api/....js`              |
| Pages           | `app/.../page.jsx`            | `pages/....jsx`                 |
| Default         | Server Components             | Client Components               |
| Data fetching   | `async` component functions   | `getServerSideProps`            |
| Layouts         | `layout.jsx` (nested)         | `_app.js` (single)              |

### Server Components

Server Components (`page.jsx`, `layout.jsx`) run **only on the server**. They:
- Can `await` database queries directly — no need for `fetch('/api/...')`
- Send zero JavaScript to the browser
- Are not interactive (no `onClick`, `useState`, etc.)
- Are the default in Next.js App Router

### Route Handlers

`route.js` files in `app/api/` export functions named after HTTP methods. Next.js maps them automatically:

```js
export async function GET(request) { ... }    // handles GET
export async function POST(request) { ... }   // handles POST
export async function DELETE(request, { params }) { ... }  // handles DELETE
```

### output: 'standalone' for Docker

In `next.config.mjs`, `output: 'standalone'` tells Next.js to create a self-contained production bundle in `.next/standalone/`. This includes only the necessary Node.js files — no `node_modules/` needed in production. The Docker image only copies this directory, resulting in a smaller, faster image.

### pg Pool

`src/lib/db.js` uses a **connection pool** (`new Pool(...)`) instead of a single client. The pool:
- Maintains up to 10 concurrent connections
- Reuses connections across requests (avoids ~100ms connection overhead per request)
- Closes idle connections after 30 seconds
- Is created once as a module-level singleton to prevent leaks during hot-reload

### initDb() on Startup

`initDb()` in `src/lib/db.js` runs `CREATE TABLE IF NOT EXISTS posts (...)`. It is called:
- In `layout.jsx` — runs on first page load
- In `src/app/api/posts/route.js` — runs on first API request

This ensures the table exists without requiring a separate migration step.

---

## 11. Screenshots

_Add screenshots here after running the app._

| Page | Description |
|------|-------------|
| `/` | Home page with hero section and recent published posts grid |
| `/posts` | All posts table with ID, title, author, status badge, and date |
| `GET /api/posts` | JSON response listing all posts |
| `GET /api/health` | JSON health check response |
