# Notes App — Vue 3 + Express + MongoDB

A full-stack sticky-note style web application built with Vue 3 (Composition API), Express.js, and MongoDB. Create, color-code, and delete notes from an elegant sticky-note UI — all backed by a RESTful API and a persistent database.

---

## 1. Project Overview

Notes App lets you manage personal notes with a sticky-note visual style. Notes can be given a **title**, optional **body text**, and a **color** (yellow, blue, green, pink, or white). Notes can also be **pinned** (via the API) so they appear at the top of the list.

The frontend is a Vue 3 Single Page Application served by **nginx**. The backend is an **Express.js** REST API connected to **MongoDB** via **Mongoose**. Everything is containerized with **Docker Compose** for one-command startup.

---

## 2. Tech Stack

| Layer       | Technology                          | Version |
|-------------|-------------------------------------|---------|
| Frontend UI | Vue 3 (Composition API, `<script setup>`) | 3.4.x   |
| Build tool  | Vite                                | 5.x     |
| HTTP client | Axios                               | 1.6.x   |
| Web server  | nginx                               | alpine  |
| Backend API | Express.js                          | 4.18.x  |
| ODM         | Mongoose                            | 8.x     |
| Database    | MongoDB                             | 7       |
| Containers  | Docker + Docker Compose             | v2      |

---

## 3. Architecture

```
Browser
   |
   | HTTP :3000
   v
+------------------+
|   nginx (Docker) |  — serves Vue SPA (static files)
|  /api  → proxy   |  — proxies /api/* and /health to backend
+------------------+
         |
         | HTTP :5000 (internal Docker network)
         v
+------------------+
|  Express.js API  |  — REST routes, validation, error handling
|  (Node 20)       |
+------------------+
         |
         | mongoose
         v
+------------------+
|   MongoDB 7      |  — persistent data in named Docker volume
+------------------+
```

**Vue reactivity system:** The frontend uses Vue 3's `ref()` for primitive reactive state and `computed()` for derived values. When `notes.value` changes (after a create/delete API call), Vue's virtual DOM diff algorithm efficiently updates only the affected DOM nodes — no manual DOM manipulation required.

---

## 4. Folder Structure

```
vue-express/
├── backend/
│   ├── src/
│   │   ├── config/db.js            # Mongoose connection
│   │   ├── models/note.model.js    # Note schema & model
│   │   ├── controllers/            # Business logic (listNotes, createNote…)
│   │   └── routes/                 # Express Router definitions
│   ├── src/app.js                  # Express app setup (middleware, routes, error handler)
│   ├── server.js                   # Entry point — connectDB then listen
│   └── Dockerfile                  # Multi-stage Node build
│
├── frontend/
│   ├── src/
│   │   ├── api/noteApi.js          # Centralized Axios API client
│   │   ├── components/
│   │   │   ├── NoteForm.vue        # New-note form component
│   │   │   ├── NoteList.vue        # Grid container component
│   │   │   └── NoteCard.vue        # Individual sticky-note card
│   │   ├── App.vue                 # Root component — state & orchestration
│   │   └── main.js                 # Vue app bootstrap
│   ├── index.html                  # Vite HTML entry point
│   ├── vite.config.js              # Vite config (plugins, dev proxy)
│   └── Dockerfile                  # Multi-stage: Vite build → nginx serve
│
├── docker-compose.yml
├── .env.example
└── .gitignore
```

**Vue Single File Components (.vue files):** Each `.vue` file bundles its template (HTML), logic (`<script setup>`), and styles (`<style scoped>`) into a single cohesive unit. Vite compiles these at build time into optimized JavaScript.

---

## 5. Local Development (without Docker)

### Prerequisites
- Node.js 20+
- MongoDB running locally on port 27017

### Backend

```bash
cd backend
cp ../.env.example .env
# Edit .env: set MONGODB_URI=mongodb://localhost:27017/notesdb
npm install
npm run dev        # nodemon watches for changes, runs on :5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev        # Vite dev server on :3000 with HMR
```

> The Vite dev server proxies `/api` and `/health` to `http://backend:5000`. For local dev without Docker, update `vite.config.js` to target `http://localhost:5000` instead.

---

## 6. Docker (Recommended)

### One-command startup

```bash
# 1. Copy and review environment variables
cp .env.example .env

# 2. Build images and start all services
docker compose up --build

# 3. Open the app
open http://localhost:3000
```

**What happens:**
1. Docker Compose starts MongoDB 7 and waits for its healthcheck to pass.
2. The Express backend starts, connects to MongoDB, and listens on :5000.
3. nginx serves the pre-built Vue SPA on :3000 and proxies API calls to the backend.

### Useful commands

```bash
docker compose logs -f backend     # Stream backend logs
docker compose down -v             # Stop all services and remove volumes
docker compose up -d               # Run in background (detached)
```

---

## 7. API Endpoints

| Method | Path                  | Description                        |
|--------|-----------------------|------------------------------------|
| GET    | `/health`             | Service health + DB connection     |
| GET    | `/api/v1/notes`       | List all notes (pinned first)      |
| POST   | `/api/v1/notes`       | Create a new note                  |
| GET    | `/api/v1/notes/:id`   | Get a single note by ID            |
| PUT    | `/api/v1/notes/:id`   | Update a note                      |
| DELETE | `/api/v1/notes/:id`   | Delete a note                      |

### Request body for POST / PUT

```json
{
  "title":   "My note title",
  "content": "Optional body text",
  "color":   "yellow",
  "pinned":  false
}
```

Valid `color` values: `yellow` | `blue` | `green` | `pink` | `white`

---

## 8. curl Examples

```bash
# Health check
curl http://localhost:5000/health

# List all notes
curl http://localhost:5000/api/v1/notes

# Create a note
curl -X POST http://localhost:5000/api/v1/notes \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy groceries","content":"Milk, eggs, bread","color":"green"}'

# Update a note (replace :id with a real MongoDB ObjectId)
curl -X PUT http://localhost:5000/api/v1/notes/:id \
  -H "Content-Type: application/json" \
  -d '{"pinned":true}'

# Delete a note
curl -X DELETE http://localhost:5000/api/v1/notes/:id
```

---

## 9. Environment Variables

| Variable        | Default                            | Description                              |
|-----------------|------------------------------------|------------------------------------------|
| `PORT`          | `5000`                             | Express server port                      |
| `MONGODB_URI`   | `mongodb://mongo:27017/notesdb`    | Full MongoDB connection string           |
| `FRONTEND_URL`  | `*`                                | CORS allowed origin (set to your domain) |
| `VITE_API_URL`  | `/api/v1`                          | API base URL (read by Vite at build time)|

> Variables prefixed with `VITE_` are embedded into the frontend bundle at build time. They are **not** secret — do not store sensitive values in them.

---

## 10. Key Vue 3 Concepts Used

### Composition API vs Options API
Vue 3 introduces the **Composition API** (`setup()` / `<script setup>`) as an alternative to the **Options API** (`data()`, `methods:`, `computed:`). The Composition API organizes code by **feature** rather than by option type, making large components easier to reason about and enabling better TypeScript support.

### `ref()` and `reactive()`
- `ref(initialValue)` wraps a primitive (string, number, boolean, array) in a reactive container. Access the value with `.value` in `<script>` — Vue automatically unwraps it in `<template>`.
- `reactive(object)` makes a plain object deeply reactive. Not used here but useful for grouped form state.

### `defineProps` and `defineEmits`
- `defineProps(['notes'])` declares the component's accepted inputs from a parent.
- `defineEmits(['note-deleted'])` declares custom events the component can emit to its parent. This creates a clear, explicit component contract.

### `<script setup>`
The `<script setup>` syntax sugar compiles to a standard `setup()` function but is more concise — all top-level variables and imports are automatically available in the template without needing `return {}`.

### Single File Components (SFCs)
Each `.vue` file contains three sections:
1. `<template>` — declarative HTML with Vue directives (`v-if`, `v-for`, `v-model`, `@event`)
2. `<script setup>` — reactive state and component logic
3. `<style scoped>` — CSS scoped to this component only (Vite adds unique attribute selectors at build time)

### Vite HMR (Hot Module Replacement)
Vite's dev server uses native ES modules in the browser. When you save a `.vue` file, only that component's module is replaced — the page state (other notes, scroll position) is preserved. This makes the development feedback loop extremely fast.

---

## 11. Screenshots

> Add screenshots of the running application here.

| View          | Screenshot              |
|---------------|-------------------------|
| Notes grid    | *(add screenshot here)* |
| Add note form | *(add screenshot here)* |
| Empty state   | *(add screenshot here)* |
