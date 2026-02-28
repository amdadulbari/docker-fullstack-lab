# PHP + MySQL Students CRUD API

A production-structured REST API built with **Core PHP** (no framework) and **MySQL**, demonstrating clean architecture patterns before you reach for Laravel or Symfony.

---

## 1. Overview

This project is a fully functional **Students CRUD API** built using only plain PHP 8.2 and PDO — no frameworks, no Composer packages, no magic. Every request goes through a single entry point, gets matched by a hand-rolled router, lands in a controller, and passes through a model that speaks SQL directly to MySQL via PDO.

The goal is **educational**: understand what frameworks actually do under the hood before you let them do it for you. When you eventually use Laravel, you will recognize every concept here — front controllers, routing, models, dependency management — because you built them yourself first.

---

## 2. Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Language    | PHP 8.2 (no framework)            |
| Database    | MySQL 8.0                         |
| DB Access   | PDO (PHP Data Objects)            |
| Server      | PHP built-in server (dev/demo)    |
| Container   | Docker + Docker Compose           |
| Auth        | None (intentionally kept simple)  |

**Why no framework?**
Because understanding the fundamentals makes you a better developer. This project shows routing, autoloading, request parsing, and SQL — all without abstraction layers hiding the details.

---

## 3. Architecture

```
HTTP Request
     |
     v
public/index.php          ← Front Controller (single entry point)
     |
     |-- loads .env
     |-- registers autoloader
     |-- sets JSON headers
     |
     v
src/Router.php            ← Matches method + URI to a handler
     |
     v
src/Controllers/          ← Reads input, calls model, writes output
  StudentController.php
  HealthController.php
     |
     v
src/Models/Student.php    ← All SQL lives here (PDO prepared statements)
     |
     v
src/Config/Database.php   ← PDO singleton (one connection per request)
     |
     v
MySQL 8.0
```

### Front Controller Pattern

Every request — regardless of URL — is handled by `public/index.php`. The web server (or PHP's built-in server) rewrites all paths to this single file. This means:

- One place to load configuration
- One place to register the autoloader
- One place to boot the router
- No scattered `require` statements across dozens of files

This is exactly what `index.php` does in Laravel, Symfony, and Slim.

### Router

`src/Router.php` stores registered routes as an array of `[method, pattern, handler]` tuples. When `dispatch()` is called, it iterates through routes, converts `{id}` placeholders into named regex capture groups (`(?P<id>[^/]+)`), and calls the matching controller method with extracted URL parameters.

### Model (Data Access Object)

`src/Models/Student.php` is the only class that knows about the `students` table. Controllers never write SQL. This separation means you can swap MySQL for PostgreSQL by only touching the model and the DSN in `Database.php`.

### Controller

Controllers sit between the HTTP layer and the model. They:
1. Read the request (URL params, JSON body)
2. Validate input
3. Call the model
4. Set the HTTP status code
5. Echo a JSON response

---

## 4. Folder Structure

```
php-mysql/
├── public/
│   └── index.php              ← ONLY file exposed to the web. All traffic enters here.
│                                 Contains: env loading, autoloader, route registration,
│                                 and the call to $router->dispatch().
│
├── src/
│   ├── Config/
│   │   └── Database.php       ← PDO singleton. Call Database::getInstance() anywhere
│   │                             to get the shared connection. Reads credentials from $_ENV.
│   │
│   ├── Controllers/
│   │   ├── StudentController.php  ← Handles all /api/students routes. Reads JSON body
│   │   │                             via php://input, validates, calls Student model,
│   │   │                             responds with appropriate HTTP status + JSON.
│   │   │
│   │   └── HealthController.php   ← GET /health — pings the DB with SELECT 1.
│   │                                 Useful for Docker healthchecks and uptime monitoring.
│   │
│   ├── Models/
│   │   └── Student.php        ← Data Access Object. All SQL is here.
│   │                             Methods: findAll, findById, create, update, delete.
│   │                             Also owns createTable() — runs on every request
│   │                             (CREATE TABLE IF NOT EXISTS is cheap and idempotent).
│   │
│   └── Router.php             ← Registers routes (get/post/put/delete methods),
│                                 converts {param} to regex, dispatches to controllers.
│
├── Dockerfile                 ← Builds php:8.2-cli-alpine, installs pdo_mysql,
│                                 creates non-root user, starts PHP built-in server.
│
├── docker-compose.yml         ← Defines two services: db (MySQL 8) and web (PHP app).
│                                 web waits for db to pass its healthcheck before starting.
│
├── .env.example               ← Template for environment variables. Copy to .env.
│
├── .dockerignore              ← Keeps .env and dev files out of the Docker build context.
│
├── .gitignore                 ← Keeps .env and editor files out of version control.
│
└── README.md                  ← You are here.
```

**Why is `public/` the only exposed directory?**

In production, your web server's document root points to `public/`, not the project root. This means `src/`, `.env`, and all other sensitive files are never directly accessible via HTTP — they are above the web root.

---

## 5. Local Setup (PHP + MySQL installed natively)

**Prerequisites:** PHP 8.2 with `pdo_mysql` extension, MySQL 8.0 running locally.

### Step 1 — Clone and configure

```bash
git clone <repo-url> php-mysql
cd php-mysql
cp .env.example .env
```

Edit `.env` and set your local MySQL credentials:

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=studentsdb
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_ROOT_PASSWORD=your_root_password
```

### Step 2 — Create the database

Log into MySQL and create the database:

```sql
CREATE DATABASE IF NOT EXISTS studentsdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

The `students` table is created automatically on the first API request (`CREATE TABLE IF NOT EXISTS`).

### Step 3 — Start the server

```bash
php -S 0.0.0.0:8080 public/index.php
```

The API is now available at `http://localhost:8080`.

### Verify it works

```bash
curl http://localhost:8080/health
```

Expected response:

```json
{"status":"ok","database":"ok","timestamp":"2026-02-27T10:00:00+00:00"}
```

---

## 6. Docker Setup (recommended)

Docker handles everything: PHP, MySQL, networking, and environment variables. No local PHP or MySQL installation needed.

### Step 1 — Copy the env file

```bash
cp .env.example .env
```

The default values in `.env.example` are already configured to work with Docker Compose (the `DB_HOST=db` matches the Docker service name).

### Step 2 — Build and start

```bash
docker compose up --build
```

Docker will:
1. Pull `mysql:8.0` and start the database
2. Wait for MySQL to pass its healthcheck (up to 70 seconds on first run)
3. Build the PHP image from `Dockerfile`
4. Start the PHP server once the database is ready

### Step 3 — Verify

```bash
curl http://localhost:8080/health
```

### Useful Docker commands

```bash
# Run in background
docker compose up --build -d

# View logs
docker compose logs -f web
docker compose logs -f db

# Stop everything
docker compose down

# Stop and remove database volume (full reset)
docker compose down -v

# Rebuild after code changes
docker compose up --build
```

---

## 7. API Endpoints

Base URL: `http://localhost:8080`

| Method   | Endpoint               | Description                        | Success Code |
|----------|------------------------|------------------------------------|--------------|
| GET      | `/health`              | Check API and database connectivity | 200          |
| GET      | `/api/students`        | List all students                  | 200          |
| POST     | `/api/students`        | Create a new student               | 201          |
| GET      | `/api/students/{id}`   | Get a single student by ID         | 200          |
| PUT      | `/api/students/{id}`   | Update a student (full or partial) | 200          |
| DELETE   | `/api/students/{id}`   | Delete a student                   | 200          |

### Request Body (POST / PUT)

```json
{
  "name":     "string, required",
  "email":    "string, required, valid email",
  "grade":    "A | B | C | D | F  (optional, defaults to C)",
  "enrolled": "1 | 0              (optional, defaults to 1)"
}
```

### Student Object (response shape)

```json
{
  "id":         1,
  "name":       "Alice Johnson",
  "email":      "alice@example.com",
  "grade":      "A",
  "enrolled":   1,
  "created_at": "2026-02-27 10:00:00",
  "updated_at": "2026-02-27 10:00:00"
}
```

---

## 8. curl Examples

### Health check

```bash
curl -s http://localhost:8080/health | jq
```

```json
{
  "status": "ok",
  "database": "ok",
  "timestamp": "2026-02-27T10:00:00+00:00"
}
```

### List all students

```bash
curl -s http://localhost:8080/api/students | jq
```

```json
{
  "count": 2,
  "students": [
    {
      "id": 2,
      "name": "Bob Smith",
      "email": "bob@example.com",
      "grade": "B",
      "enrolled": 1,
      "created_at": "2026-02-27 10:05:00",
      "updated_at": "2026-02-27 10:05:00"
    },
    {
      "id": 1,
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "grade": "A",
      "enrolled": 1,
      "created_at": "2026-02-27 10:00:00",
      "updated_at": "2026-02-27 10:00:00"
    }
  ]
}
```

### Create a student

```bash
curl -s -X POST http://localhost:8080/api/students \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice Johnson", "email": "alice@example.com", "grade": "A"}' | jq
```

```json
{
  "id": 1,
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "grade": "A",
  "enrolled": 1,
  "created_at": "2026-02-27 10:00:00",
  "updated_at": "2026-02-27 10:00:00"
}
```

### Get a student by ID

```bash
curl -s http://localhost:8080/api/students/1 | jq
```

```json
{
  "id": 1,
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "grade": "A",
  "enrolled": 1,
  "created_at": "2026-02-27 10:00:00",
  "updated_at": "2026-02-27 10:00:00"
}
```

### Update a student

```bash
curl -s -X PUT http://localhost:8080/api/students/1 \
  -H "Content-Type: application/json" \
  -d '{"grade": "A", "enrolled": 0}' | jq
```

```json
{
  "id": 1,
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "grade": "A",
  "enrolled": 0,
  "created_at": "2026-02-27 10:00:00",
  "updated_at": "2026-02-27 10:15:00"
}
```

### Delete a student

```bash
curl -s -X DELETE http://localhost:8080/api/students/1 | jq
```

```json
{
  "message": "Student deleted successfully"
}
```

### Validation error — missing required field

```bash
curl -s -X POST http://localhost:8080/api/students \
  -H "Content-Type: application/json" \
  -d '{"name": "Charlie"}' | jq
```

```json
{
  "error": "'name' and 'email' are required"
}
```

HTTP status: `400 Bad Request`

### Validation error — invalid email

```bash
curl -s -X POST http://localhost:8080/api/students \
  -H "Content-Type: application/json" \
  -d '{"name": "Charlie", "email": "not-an-email"}' | jq
```

```json
{
  "error": "Invalid email format"
}
```

HTTP status: `400 Bad Request`

### Not found

```bash
curl -s http://localhost:8080/api/students/9999 | jq
```

```json
{
  "error": "Student not found"
}
```

HTTP status: `404 Not Found`

---

## 9. Environment Variables

All configuration is read from the `.env` file at the project root. The file is never committed to version control — only `.env.example` is committed as a template.

| Variable          | Default          | Description                                        |
|-------------------|------------------|----------------------------------------------------|
| `DB_HOST`         | `db`             | MySQL hostname. Use `db` in Docker, `127.0.0.1` locally. |
| `DB_PORT`         | `3306`           | MySQL port.                                        |
| `DB_NAME`         | `studentsdb`     | Database name to connect to.                       |
| `DB_USER`         | `student_user`   | MySQL user (not root) for the application.         |
| `DB_PASSWORD`     | `studentpassword`| Password for `DB_USER`.                            |
| `DB_ROOT_PASSWORD`| `rootpassword`   | MySQL root password (used by Docker to init MySQL). Not used by the app. |

**Important:** Change all default passwords before deploying anywhere beyond your local machine.

---

## 10. Key Concepts

### Front Controller Pattern

All requests funnel through `public/index.php`. This is not a limitation — it is a deliberate design. Benefits:

- **Single bootstrap point:** environment loading, autoloading, and global headers happen once.
- **Centralized routing:** every URL is handled by the router, making it easy to audit all endpoints.
- **Security:** the web server's document root is `public/`, so `src/`, `.env`, and other files are never web-accessible.

Laravel's `public/index.php` does exactly this. You just wrote a simpler version.

### PDO Prepared Statements and SQL Injection Prevention

**Never do this:**

```php
// DANGEROUS — user input directly in the query string
$stmt = $db->query("SELECT * FROM students WHERE id = " . $_GET['id']);
```

An attacker can pass `id=1 OR 1=1` and get every row, or worse, `id=1; DROP TABLE students`.

**Always do this:**

```php
// SAFE — placeholder separates query structure from data
$stmt = $db->prepare('SELECT * FROM students WHERE id = ?');
$stmt->execute([$id]);
```

PDO sends the query and the data separately to MySQL. MySQL parses the query structure before it ever sees the user's value — so there is nothing to inject into. This project uses prepared statements for every query that touches user input.

### Singleton Pattern for Database Connection

`Database::getInstance()` returns the same `PDO` object on every call within a single request. The first call creates the connection; all subsequent calls return the cached instance.

```php
// First call — creates the connection
$pdo = Database::getInstance();

// Second call (from a different class) — returns the same object
$pdo = Database::getInstance(); // no new TCP connection
```

Opening a database connection takes time (TCP handshake, authentication). A typical request might call `findAll()`, then `findById()`. Without the singleton, that would be two connection attempts. With it, it is one.

### Manual Autoloader vs. Composer

This project uses `spl_autoload_register()` to implement PSR-4 style class loading without Composer:

```
App\Controllers\StudentController
→ src/Controllers/StudentController.php
```

In a real project, you would use `composer dump-autoload` which generates an optimized class map. The manual approach here is intentional — it shows what Composer's autoloader actually does.

### No Framework vs. Framework Tradeoffs

| Aspect              | Plain PHP (this project)           | Framework (Laravel, Symfony)                     |
|---------------------|------------------------------------|--------------------------------------------------|
| Setup time          | Fast — just PHP files              | Composer install, config, directory structure    |
| Lines of boilerplate| High — you write everything        | Low — conventions handle the common cases        |
| Learning value      | High — you see every layer         | Low for beginners — magic hides the details      |
| Maintainability     | Gets harder as the app grows       | Scales well — mature conventions and tooling     |
| Security            | Your responsibility entirely       | Framework handles many security defaults         |
| Ecosystem           | Write your own or vendored manually| Thousands of tested packages via Packagist       |
| Testing             | Harder to unit test without DI     | Built-in testing support, DI containers          |

This project is the right size for "plain PHP." Once you need authentication, queuing, ORM, caching, or a team working on the same codebase, reach for a framework.

---

## 11. Screenshots

_Add screenshots of your API responses here once the project is running._

**Suggested captures:**

- Terminal output of `docker compose up --build` showing both services healthy
- `curl /health` response in the terminal
- `curl POST /api/students` creating a student
- `curl GET /api/students` listing all students
- A tool like Postman or Insomnia showing a full CRUD session
- `curl` showing a 400 validation error response
- `curl` showing a 404 not found response

---

## License

MIT — use this freely for learning, teaching, or as a starter template.
