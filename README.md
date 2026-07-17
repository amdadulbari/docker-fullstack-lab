# docker-fullstack-lab

Dockerized full-stack apps across 10+ frameworks (React, Angular, Next.js, Django, FastAPI, Spring Boot, Laravel & more) — a hands-on lab for DevOps engineers to practice containerization patterns.

---

## What's Inside

Each project is a self-contained full-stack application with its own `Dockerfile`, `docker-compose.yml`, and `.env.example`. Every stack follows the same layered architecture and exposes a `GET /health` endpoint for container health checks.

| Project | Frontend | Backend | Database |
|---------|----------|---------|----------|
| `react-node` | React 18 + Vite | Express.js | PostgreSQL |
| `vue-express` | Vue 3 | Express.js | MongoDB |
| `angular-springboot` | Angular 17 | Spring Boot 3 | PostgreSQL |
| `nextjs-postgres` | Next.js 14 (SSR) | Route Handlers | PostgreSQL |
| `express-mongo` | — | Express.js | MongoDB |
| `nestjs-postgres` | — | NestJS | PostgreSQL |
| `fastapi-postgres` | — | FastAPI | PostgreSQL |
| `django-postgres` | — | Django + DRF | PostgreSQL |
| `flask-redis` | — | Flask | Redis |
| `laravel-mysql` | — | Laravel 11 | MySQL |
| `php-mysql` | — | Core PHP | MySQL |
| `springboot-gradle-postgres` | — | Spring Boot (Gradle) | PostgreSQL |
| `springboot-maven-mysql` | — | Spring Boot (Maven) | MySQL |
| `dotnet-postgres` | — | ASP.NET Core 8 Web API | PostgreSQL |
| `elk-stack` | — | Elasticsearch, Logstash, Kibana | — |

## Dockerfile Teaching Examples

Two focused, **frontend-only** React (Vite) apps for learning how to *write*
Dockerfiles. They are self-contained (no backend, database, or API keys), so
they build and run anywhere — ideal for a hands-on class.

| Project | Dockerfile style | Runs | Image size | Open at |
|---------|------------------|------|-----------|---------|
| `react-dev-singlestage` | **Single-stage**, development mode | Vite dev server + HMR | ~450 MB | http://localhost:5173 |
| `react-nginx-multistage` | **Multi-stage**, production | nginx serving static build | ~74 MB | http://localhost:8080 |

Read them side by side to understand *why* production frontends use multi-stage
builds — the multi-stage image is ~6× smaller because Node.js and `node_modules`
are discarded after the build stage. Each folder's `README.md` walks through its
`Dockerfile` line by line.

## Getting Started

Every project follows the same workflow:

```bash
cd <project-name>
cp .env.example .env
docker compose up --build
```

Then hit the health endpoint to confirm everything is running:

```bash
curl http://localhost:<port>/health
```

Each project has its own `README.md` with the exact port, available API endpoints, and stack-specific notes.

## What You'll Practice

- Writing multi-stage `Dockerfile`s for different runtimes (Node.js, Python, Java, PHP)
- Composing multi-service applications with `docker-compose.yml`
- Networking containers (frontend → backend → database)
- Using environment variables for configuration
- Adding health checks to Docker services
- Serving frontends via nginx as a reverse proxy
