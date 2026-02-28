# Inventory API — Spring Boot (Gradle) + PostgreSQL

A production-structured REST API for managing inventory items, built with Spring Boot 3.2,
Gradle 8.6, and PostgreSQL 16. The entire stack runs in Docker with a single command.

---

## 1. Project Overview

This project is a fully functional CRUD (Create, Read, Update, Delete) REST API that manages
inventory items in a PostgreSQL database. It demonstrates:

- A clean **layered architecture** (Controller → Service → Repository → Database)
- **Gradle** as the build tool (instead of Maven)
- **Docker multi-stage builds** so you never need Java or Gradle installed locally
- **Bean Validation** with structured error responses
- **JPA / Hibernate** auto-schema generation
- Centralised **exception handling** via `@RestControllerAdvice`
- A lightweight **health-check endpoint** that probes the database connection

---

## 2. Tech Stack

| Layer              | Technology                  | Version |
|--------------------|-----------------------------|---------|
| Language           | Java                        | 17      |
| Framework          | Spring Boot                 | 3.2.3   |
| Build tool         | Gradle                      | 8.6     |
| Persistence        | Spring Data JPA / Hibernate | 6.x     |
| Database           | PostgreSQL                  | 16      |
| Code generation    | Lombok                      | latest  |
| Containerisation   | Docker + Docker Compose     | v2      |

---

## 3. Architecture

### Request flow

```
HTTP Client
    |
    v
+-------------------+
|  ItemController   |   @RestController — parses HTTP, validates input, returns ResponseEntity
+-------------------+
    |
    v
+-------------------+
|   ItemService     |   @Service — business logic, transaction management
+-------------------+
    |
    v
+-------------------+
| ItemRepository    |   @Repository / JpaRepository — generated SQL queries
+-------------------+
    |
    v
+-------------------+
|   PostgreSQL DB   |   "items" table, managed by Hibernate ddl-auto
+-------------------+
```

### Layered architecture explanation

| Layer          | Responsibility                                                                    |
|----------------|-----------------------------------------------------------------------------------|
| **Controller** | HTTP concerns only — deserialise JSON, validate with `@Valid`, build responses.   |
| **Service**    | Business logic and transactions. Controllers should never talk to repositories directly. |
| **Repository** | Data access. Spring Data JPA generates all SQL from interface method names.       |
| **Model**      | JPA entities that map to database tables.                                          |
| **Exception**  | `GlobalExceptionHandler` catches all errors and returns consistent JSON bodies.   |

---

## 4. Folder Structure

```
springboot-gradle-postgres/
├── src/
│   └── main/
│       ├── java/com/example/inventory/
│       │   ├── controller/          # HTTP layer — ItemController, HealthController
│       │   ├── model/               # JPA entities — Item.java
│       │   ├── repository/          # Spring Data interfaces — ItemRepository
│       │   ├── service/             # Business logic — ItemService
│       │   ├── exception/           # Error handling — ResourceNotFoundException, GlobalExceptionHandler
│       │   └── InventoryApplication.java   # Main entry point
│       └── resources/
│           └── application.properties     # Config (reads from env vars)
├── build.gradle          # Gradle build script (equivalent of Maven's pom.xml)
├── settings.gradle       # Root project name
├── gradlew               # Placeholder — see note below
├── Dockerfile            # Multi-stage build (builder + production)
├── docker-compose.yml    # Orchestrates db + web services
├── .env.example          # Copy to .env and fill in your values
├── .dockerignore
├── .gitignore
└── README.md
```

### Gradle vs Maven

| Aspect          | Gradle (`build.gradle`)          | Maven (`pom.xml`)             |
|-----------------|----------------------------------|-------------------------------|
| Syntax          | Groovy/Kotlin DSL                | XML                           |
| Build speed     | Faster (incremental builds)      | Slower (full recompile)       |
| Wrapper         | `gradlew` / `gradlew.bat`        | `mvnw` / `mvnw.cmd`           |
| Dependency      | `implementation '...'`           | `<dependency>...</dependency>`|
| Fat JAR task    | `bootJar`                        | `spring-boot:repackage`       |

The `gradlew` file in this repository is a **placeholder** explaining that the Gradle Wrapper
is either generated locally (`gradle wrapper`) or is provided by the Docker builder image
(`gradle:8.6-jdk17-alpine`) during `docker compose up --build`. The Docker workflow requires
no local Gradle installation.

---

## 5. Local Setup (without Docker)

### Prerequisites
- Java 17 (e.g. via [SDKMAN](https://sdkman.io): `sdk install java 17-tem`)
- Gradle 8.6 installed, **or** generate the real wrapper with `gradle wrapper --gradle-version 8.6`
- A running PostgreSQL instance

### Steps

```bash
# 1. Clone the repository
git clone <repo-url>
cd springboot-gradle-postgres

# 2. Set environment variables (or export them in your shell)
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=inventorydb
export DB_USER=invuser
export DB_PASSWORD=invpassword

# 3. Run with Gradle
gradle bootRun
# or, if you generated the wrapper:
./gradlew bootRun
```

The application will start on **http://localhost:8080**.

---

## 6. Docker Setup (recommended)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose v2)

### Steps

```bash
# 1. Clone the repository
git clone <repo-url>
cd springboot-gradle-postgres

# 2. Create your .env file from the example
cp .env.example .env
# Edit .env if you want to change passwords or ports

# 3. Build and start all services
docker compose up --build
```

> **Note:** The first build downloads the Gradle 8.6 distribution (~100 MB) and all Maven
> Central dependencies (~200 MB). This can take 5–10 minutes. Subsequent builds are fast
> because Docker caches the Gradle home directory inside the image layer.

### Useful commands

```bash
# Run in the background
docker compose up --build -d

# View logs
docker compose logs -f web
docker compose logs -f db

# Stop everything
docker compose down

# Stop and remove the database volume (destructive — wipes all data)
docker compose down -v
```

The API will be available at **http://localhost:8080** once the `web` service passes its
startup checks.

---

## 7. API Endpoints

| Method   | Path                   | Description                                | Auth |
|----------|------------------------|--------------------------------------------|------|
| `GET`    | `/health`              | Health check — pings the database          | None |
| `GET`    | `/api/v1/items`        | List all items (optionally filter by warehouse) | None |
| `POST`   | `/api/v1/items`        | Create a new item                          | None |
| `GET`    | `/api/v1/items/{id}`   | Get a single item by ID                    | None |
| `PUT`    | `/api/v1/items/{id}`   | Replace all fields of an existing item     | None |
| `DELETE` | `/api/v1/items/{id}`   | Delete an item                             | None |

### Query parameters

| Endpoint          | Parameter   | Type   | Description                            |
|-------------------|-------------|--------|----------------------------------------|
| `GET /api/v1/items` | `warehouse` | String | Filter results by warehouse identifier |

---

## 8. curl Examples

### Check health

```bash
curl -s http://localhost:8080/health | jq .
```

Expected response (200 OK):
```json
{
  "timestamp": "2026-02-27T12:00:00.123",
  "status": "UP",
  "database": "UP"
}
```

---

### Create an item

```bash
curl -s -X POST http://localhost:8080/api/v1/items \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wireless Keyboard",
    "description": "Compact Bluetooth keyboard with backlight",
    "price": 49.99,
    "quantity": 150,
    "warehouse": "WAREHOUSE_A",
    "available": true
  }' | jq .
```

Expected response (201 Created):
```json
{
  "id": 1,
  "name": "Wireless Keyboard",
  "description": "Compact Bluetooth keyboard with backlight",
  "price": 49.99,
  "quantity": 150,
  "warehouse": "WAREHOUSE_A",
  "available": true,
  "createdAt": "2026-02-27T12:00:01.456",
  "updatedAt": "2026-02-27T12:00:01.456"
}
```

---

### List all items

```bash
curl -s http://localhost:8080/api/v1/items | jq .
```

---

### Filter items by warehouse

```bash
curl -s "http://localhost:8080/api/v1/items?warehouse=WAREHOUSE_A" | jq .
```

---

### Get a single item

```bash
curl -s http://localhost:8080/api/v1/items/1 | jq .
```

---

### Update an item

```bash
curl -s -X PUT http://localhost:8080/api/v1/items/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wireless Keyboard Pro",
    "description": "Updated model with USB-C charging",
    "price": 59.99,
    "quantity": 200,
    "warehouse": "WAREHOUSE_B",
    "available": true
  }' | jq .
```

---

### Delete an item

```bash
curl -s -X DELETE http://localhost:8080/api/v1/items/1
# Returns HTTP 204 No Content (empty body)
```

---

### 404 response example

```bash
curl -s http://localhost:8080/api/v1/items/9999 | jq .
```

Expected response (404 Not Found):
```json
{
  "timestamp": "2026-02-27T12:00:05.789",
  "status": 404,
  "error": "Item not found with id: 9999"
}
```

---

### Validation error example

```bash
curl -s -X POST http://localhost:8080/api/v1/items \
  -H "Content-Type: application/json" \
  -d '{"name": "", "price": -5, "quantity": -1}' | jq .
```

Expected response (400 Bad Request):
```json
{
  "timestamp": "2026-02-27T12:00:06.001",
  "status": 400,
  "error": "Validation failed",
  "message": "One or more fields have invalid values",
  "fieldErrors": {
    "name": "Item name must not be blank",
    "price": "Price must be zero or positive",
    "quantity": "Quantity must be zero or positive"
  }
}
```

---

## 9. Environment Variables

| Variable       | Default (in app) | Required | Description                                               |
|----------------|-----------------|----------|-----------------------------------------------------------|
| `PORT`         | `8080`          | No       | HTTP port the Spring Boot server listens on               |
| `DB_HOST`      | `db`            | No       | PostgreSQL hostname (matches the Docker Compose service name) |
| `DB_PORT`      | `5432`          | No       | PostgreSQL port                                           |
| `DB_NAME`      | —               | **Yes**  | Name of the PostgreSQL database                           |
| `DB_USER`      | —               | **Yes**  | PostgreSQL username                                       |
| `DB_PASSWORD`  | —               | **Yes**  | PostgreSQL password                                       |
| `JPA_DDL_AUTO` | `update`        | No       | Hibernate schema strategy: `update`, `validate`, `create`, `none` |
| `JPA_SHOW_SQL` | `false`         | No       | Log generated SQL statements to stdout                    |

> **Production tip:** Change `JPA_DDL_AUTO` from `update` to `validate` (or `none`) in
> production environments and manage schema changes with a migration tool such as
> [Flyway](https://flywaydb.org/) or [Liquibase](https://www.liquibase.org/).

---

## 10. Key Concepts

### Spring Boot Gradle vs Maven

Spring Boot supports both build tools equally. Gradle is favoured in many modern projects
because its incremental build cache makes large builds significantly faster. The key file is
`build.gradle` (instead of Maven's `pom.xml`), and dependencies are declared with Groovy
(or Kotlin) DSL syntax rather than XML.

### `@Entity` and JPA auto-schema

The `@Entity` annotation on `Item.java` tells Hibernate that this class maps to a database
table. With `spring.jpa.hibernate.ddl-auto=update`, Hibernate inspects the entity classes at
startup and automatically creates or alters the `items` table to match the current field
definitions — no SQL migration files required for development.

### `@Repository` and Spring Data JPA

`ItemRepository` extends `JpaRepository<Item, Long>`. Spring Data generates a proxy class at
runtime that implements all the inherited CRUD methods and the custom derived-query methods
(e.g. `findByWarehouse`) by parsing the method names according to naming conventions. You
write zero SQL for standard queries.

### `@Service`

`ItemService` is annotated with `@Service`, which marks it as a Spring-managed bean in the
service layer. `@Transactional` on individual methods ensures that all database operations
within a method run inside a single transaction — changes are committed on success or rolled
back on any unchecked exception.

### `@RestController`

`@RestController` is shorthand for `@Controller + @ResponseBody`. Every method return value
is automatically serialised to JSON by Jackson and written to the HTTP response body. Combined
with `ResponseEntity<T>`, you have full control over the HTTP status code, headers, and body.

### Lombok

Lombok is an annotation processor that generates boilerplate Java code (getters, setters,
constructors, `equals`, `hashCode`, `toString`) at compile time via the `annotationProcessor`
Gradle configuration. This keeps entity and service classes concise without sacrificing
functionality.

---

## 11. Screenshots

> Add screenshots of:
> - `docker compose up --build` terminal output
> - `curl` health-check response
> - `curl` item creation response
> - The items list filtered by warehouse
> - A 404 error response

---

*Built with Spring Boot 3.2, Gradle 8.6, and PostgreSQL 16.*
