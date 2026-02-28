# Employees API — Spring Boot + Maven + MySQL

A production-structured RESTful CRUD API for managing employees, built with Spring Boot 3.2, Spring Data JPA, Hibernate, and MySQL 8. Fully containerized with Docker and Docker Compose.

---

## Tech Stack

| Technology         | Version  | Purpose                                      |
|--------------------|----------|----------------------------------------------|
| Java               | 17       | Application runtime                          |
| Spring Boot        | 3.2.3    | Framework, auto-configuration, embedded Tomcat|
| Spring Data JPA    | (managed)| Repository abstraction over Hibernate        |
| Hibernate          | (managed)| ORM — maps Java objects to MySQL tables      |
| MySQL              | 8.0      | Relational database                          |
| Lombok             | (managed)| Boilerplate code generation (getters, etc.)  |
| Maven              | 3.9.6    | Build tool and dependency management         |
| Docker             | latest   | Containerization                             |
| Docker Compose     | v2       | Multi-container orchestration                |

---

## Architecture

```
HTTP Request
     │
     ▼
┌──────────────────────────────────────────┐
│           Controller Layer               │
│  EmployeeController  /api/v1/employees   │
│  HealthController    /health             │
│  (handles HTTP: routing, validation,     │
│   status codes, request/response bodies) │
└───────────────────┬──────────────────────┘
                    │ delegates to
                    ▼
┌──────────────────────────────────────────┐
│            Service Layer                 │
│           EmployeeService                │
│  (business logic: find, create, update,  │
│   delete; throws domain exceptions)      │
└───────────────────┬──────────────────────┘
                    │ calls
                    ▼
┌──────────────────────────────────────────┐
│          Repository Layer                │
│         EmployeeRepository               │
│  (Spring Data JPA — auto-generates SQL   │
│   from method names; extends JpaRepo)    │
└───────────────────┬──────────────────────┘
                    │ queries
                    ▼
┌──────────────────────────────────────────┐
│              MySQL 8.0                   │
│           employees table                │
│  (id, name, email, department, position, │
│   salary, active, createdAt, updatedAt)  │
└──────────────────────────────────────────┘
```

**Layered Architecture** separates concerns:
- **Controller** — HTTP boundary: parses requests, returns responses, delegates everything else
- **Service** — Business logic: orchestrates operations, enforces rules, throws domain exceptions
- **Repository** — Data access: Spring Data JPA generates SQL queries from method signatures
- **Model** — JPA entity: annotated POJO that Hibernate maps to the `employees` table
- **Exception** — Cross-cutting: `ResourceNotFoundException` for 404s; `GlobalExceptionHandler` for consistent JSON error responses

---

## Folder Structure

```
springboot-maven-mysql/
├── src/
│   └── main/
│       ├── java/
│       │   └── com/example/employees/
│       │       ├── EmployeesApplication.java   # @SpringBootApplication entry point
│       │       ├── controller/
│       │       │   ├── EmployeeController.java # CRUD REST endpoints
│       │       │   └── HealthController.java   # /health liveness + DB check
│       │       ├── model/
│       │       │   └── Employee.java           # JPA entity / request body
│       │       ├── repository/
│       │       │   └── EmployeeRepository.java # Spring Data JPA interface
│       │       ├── service/
│       │       │   └── EmployeeService.java    # Business logic layer
│       │       └── exception/
│       │           ├── ResourceNotFoundException.java  # 404 domain exception
│       │           └── GlobalExceptionHandler.java     # Unified JSON error handler
│       └── resources/
│           └── application.properties          # All configuration (env-variable-driven)
├── pom.xml                # Maven: dependencies + Spring Boot plugin
├── Dockerfile             # Multi-stage build (builder → minimal JRE image)
├── docker-compose.yml     # Wires db + web services with health checks
├── .env.example           # Template for required environment variables
├── .dockerignore          # Keeps the Docker build context clean
├── .gitignore             # Excludes target/, secrets, IDE files
└── README.md
```

### Package responsibilities

| Package       | Responsibility                                                              |
|---------------|-----------------------------------------------------------------------------|
| `controller`  | Receive HTTP requests, validate input, return HTTP responses                |
| `model`       | JPA entity definition; Bean Validation constraints on fields                |
| `repository`  | Database queries — Spring Data generates SQL from method names              |
| `service`     | Business logic, orchestration, throws exceptions when invariants are broken |
| `exception`   | Custom exception types + `@RestControllerAdvice` global error handler       |

---

## Local Setup (without Docker)

### Prerequisites
- Java 17+ (`java -version`)
- Maven 3.9+ (`mvn -version`)
- MySQL 8.0 running locally

### Steps

1. Clone or download the project.

2. Create the database and user in MySQL:
   ```sql
   CREATE DATABASE employeesdb;
   CREATE USER 'empuser'@'localhost' IDENTIFIED BY 'emppassword';
   GRANT ALL PRIVILEGES ON employeesdb.* TO 'empuser'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. Export the required environment variables (or set them in your shell):
   ```bash
   export DB_HOST=localhost
   export DB_PORT=3306
   export DB_NAME=employeesdb
   export DB_USER=empuser
   export DB_PASSWORD=emppassword
   ```

4. Run the application:
   ```bash
   mvn spring-boot:run
   ```

5. The API is available at `http://localhost:8080`.

---

## Docker Setup (recommended)

### Prerequisites
- Docker Engine 24+
- Docker Compose v2

### Steps

```bash
# 1. Copy the environment template
cp .env.example .env

# 2. (Optional) Edit .env to change passwords or ports
nano .env

# 3. Build the image and start both services
docker compose up --build

# 4. Run in detached mode
docker compose up --build -d

# 5. View logs
docker compose logs -f web

# 6. Stop and remove containers
docker compose down

# 7. Stop and also remove the persistent volume (deletes all data)
docker compose down -v
```

The `web` service waits for the `db` service to pass its health check before starting, so Spring Boot will not attempt a database connection until MySQL is ready.

---

## API Endpoints

| Method   | Endpoint                    | Description                              | Status Codes        |
|----------|-----------------------------|------------------------------------------|---------------------|
| `GET`    | `/health`                   | Liveness check + DB connectivity        | 200, 500            |
| `GET`    | `/api/v1/employees`         | List all employees                       | 200                 |
| `GET`    | `/api/v1/employees?department=X` | Filter employees by department      | 200                 |
| `POST`   | `/api/v1/employees`         | Create a new employee                    | 201, 400            |
| `GET`    | `/api/v1/employees/{id}`    | Get a single employee by ID              | 200, 404            |
| `PUT`    | `/api/v1/employees/{id}`    | Replace an employee record               | 200, 400, 404       |
| `DELETE` | `/api/v1/employees/{id}`    | Delete an employee                       | 204, 404            |

---

## curl Examples

### Health check

```bash
curl -s http://localhost:8080/health | jq
```

**Response (200 OK):**
```json
{
  "status": "ok",
  "database": "ok",
  "timestamp": "2026-02-27T10:00:00.000Z"
}
```

---

### Create an employee (POST)

```bash
curl -s -X POST http://localhost:8080/api/v1/employees \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "department": "Engineering",
    "position": "Senior Engineer",
    "salary": 95000.00,
    "active": true
  }' | jq
```

**Response (201 Created):**
```json
{
  "id": 1,
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "department": "Engineering",
  "position": "Senior Engineer",
  "salary": 95000.00,
  "active": true,
  "createdAt": "2026-02-27T10:01:00",
  "updatedAt": "2026-02-27T10:01:00"
}
```

---

### List all employees (GET)

```bash
curl -s http://localhost:8080/api/v1/employees | jq
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "department": "Engineering",
    "position": "Senior Engineer",
    "salary": 95000.00,
    "active": true,
    "createdAt": "2026-02-27T10:01:00",
    "updatedAt": "2026-02-27T10:01:00"
  }
]
```

---

### Filter by department (GET with query param)

```bash
curl -s "http://localhost:8080/api/v1/employees?department=Engineering" | jq
```

---

### Get employee by ID (GET)

```bash
curl -s http://localhost:8080/api/v1/employees/1 | jq
```

**Response (404 Not Found) when ID does not exist:**
```json
{
  "error": "Not Found",
  "message": "Employee not found with id: 999",
  "timestamp": "2026-02-27T10:05:00.000Z"
}
```

---

### Update an employee (PUT)

```bash
curl -s -X PUT http://localhost:8080/api/v1/employees/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice.johnson@example.com",
    "department": "Engineering",
    "position": "Staff Engineer",
    "salary": 110000.00,
    "active": true
  }' | jq
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Alice Johnson",
  "email": "alice.johnson@example.com",
  "department": "Engineering",
  "position": "Staff Engineer",
  "salary": 110000.00,
  "active": true,
  "createdAt": "2026-02-27T10:01:00",
  "updatedAt": "2026-02-27T10:10:00"
}
```

---

### Delete an employee (DELETE)

```bash
curl -s -o /dev/null -w "%{http_code}" -X DELETE http://localhost:8080/api/v1/employees/1
# Returns: 204
```

---

### Validation error example

Sending a POST with missing required fields returns 400 Bad Request:

```bash
curl -s -X POST http://localhost:8080/api/v1/employees \
  -H "Content-Type: application/json" \
  -d '{"email": "not-a-valid-email"}' | jq
```

**Response (400 Bad Request):**
```json
{
  "error": "Validation Failed",
  "message": "name: Name is required, email: Email must be valid, department: Department is required, position: Position is required",
  "timestamp": "2026-02-27T10:15:00.000Z"
}
```

---

## Environment Variables

| Variable           | Default (in app) | Required | Description                                    |
|--------------------|------------------|----------|------------------------------------------------|
| `PORT`             | `8080`           | No       | Port the Spring Boot server listens on         |
| `DB_HOST`          | `db`             | Yes      | MySQL hostname (use `localhost` for local dev) |
| `DB_PORT`          | `3306`           | No       | MySQL port                                     |
| `DB_NAME`          | —                | Yes      | MySQL database/schema name                     |
| `DB_USER`          | —                | Yes      | MySQL username                                 |
| `DB_PASSWORD`      | —                | Yes      | MySQL user password                            |
| `DB_ROOT_PASSWORD` | —                | Yes*     | MySQL root password (Docker Compose only)      |
| `JPA_DDL_AUTO`     | `update`         | No       | Hibernate schema strategy (`update`/`validate`)|
| `JPA_SHOW_SQL`     | `false`          | No       | Log SQL statements to console                  |

> `DB_ROOT_PASSWORD` is only required when launching MySQL via Docker Compose.

---

## Key Spring Boot Concepts

### `@SpringBootApplication`
Placed on the main class. Combines `@Configuration` (bean definitions), `@EnableAutoConfiguration` (auto-wires beans based on classpath), and `@ComponentScan` (scans the current package and subpackages for Spring components).

### `@RestController`
Marks a class as an HTTP controller where every method returns data serialized directly to the response body (equivalent to `@Controller` + `@ResponseBody` on every method). Spring uses Jackson to serialize/deserialize Java objects to/from JSON.

### `@Service`
Marks a class as a service component (business logic layer). Spring creates a singleton bean and makes it available for dependency injection.

### `@Repository`
Marks an interface or class as a data access component. Spring Data JPA implements the interface at runtime, generating SQL queries from method names like `findByDepartment`.

### Spring Data JPA
`JpaRepository<Employee, Long>` provides ready-made CRUD methods (`findAll`, `findById`, `save`, `deleteById`, `count`, etc.) without writing a single line of SQL. Custom queries are derived from method names using Spring's query derivation strategy.

### Lombok
Annotation processor that generates boilerplate at compile time:
- `@Data` — generates `getters`, `setters`, `equals`, `hashCode`, `toString`
- `@NoArgsConstructor` / `@AllArgsConstructor` — generate constructors
- `@RequiredArgsConstructor` — generates a constructor injecting all `final` fields (used for constructor-based dependency injection)

### JPA Annotations
| Annotation                          | Purpose                                                    |
|-------------------------------------|------------------------------------------------------------|
| `@Entity`                           | Marks class as a JPA-managed entity                        |
| `@Table(name = "employees")`        | Maps entity to a specific table name                       |
| `@Id`                               | Marks the primary key field                                |
| `@GeneratedValue(IDENTITY)`         | Auto-increment primary key (delegated to MySQL)            |
| `@Column(nullable=false, ...)`      | Column-level constraints and metadata                      |
| `@CreationTimestamp`                | Hibernate sets this field on INSERT                        |
| `@UpdateTimestamp`                  | Hibernate updates this field on every UPDATE               |

### Bean Validation
`@NotBlank`, `@Email`, `@Size`, `@DecimalMin` are JSR-380 annotations on the entity fields. Pairing them with `@Valid` on the controller method parameter triggers validation before the handler runs. Violations are caught by `GlobalExceptionHandler` and returned as a structured 400 response.

### `@RestControllerAdvice`
A global interceptor for all controllers. `@ExceptionHandler` methods inside it catch specific exception types thrown anywhere in the controller/service stack and return consistent JSON error envelopes, replacing Spring's default HTML error page.

---

## Screenshots

_Add screenshots of:_
- Successful `POST /api/v1/employees` response
- `GET /api/v1/employees` list response
- `GET /health` response
- A 404 error response
- A 400 validation error response
- `docker compose up --build` terminal output
