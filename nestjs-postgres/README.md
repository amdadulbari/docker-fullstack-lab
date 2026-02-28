# NestJS PostgreSQL Users API

A production-structured REST API for user management built with NestJS 10, TypeORM 0.3, and PostgreSQL 16. Demonstrates NestJS core concepts: modules, controllers, services, entities, DTOs, and dependency injection.

---

## Tech Stack

| Technology       | Version  | Role                                      |
|------------------|----------|-------------------------------------------|
| NestJS           | ^10.3.2  | Node.js framework (controllers, DI, pipes)|
| TypeORM          | ^0.3.20  | ORM for PostgreSQL (entities, repositories)|
| PostgreSQL       | 16       | Relational database                       |
| class-validator  | ^0.14.1  | Runtime DTO validation decorators         |
| class-transformer| ^0.5.1   | Type coercion (string params to numbers)  |
| TypeScript       | ^5.3.3   | Static typing and decorator support       |
| Docker           | -        | Containerization and local dev environment|

---

## Architecture

### Request Lifecycle

```
HTTP Request
    |
    v
+-------------------+
|    main.ts        |  Bootstrap + Global ValidationPipe
+-------------------+
    |
    v
+-------------------+
|   Controller      |  Route matching, param extraction, @Body(), @Param()
|  (users.controller)|
+-------------------+
    |
    v
+-------------------+
|    Service        |  Business logic, error handling (NotFoundException)
|  (users.service)  |
+-------------------+
    |
    v
+-------------------+
|   Repository      |  TypeORM abstraction over raw SQL
| (Repository<User>)|
+-------------------+
    |
    v
+-------------------+
|   PostgreSQL DB   |  Persistent storage — "users" table
+-------------------+
```

### NestJS Module System

NestJS structures applications as a tree of modules:

```
AppModule (root)
├── ConfigModule    (global — provides ConfigService everywhere)
├── TypeOrmModule   (global — provides DataSource + Repositories)
├── UsersModule
│   ├── UsersController  (/users routes)
│   ├── UsersService     (business logic)
│   └── User entity      (TypeORM → "users" table)
└── HealthModule
    └── HealthController (/health route)
```

Each module is self-contained. `AppModule` is the composition root that wires everything together.

---

## Folder Structure

```
nestjs-postgres/
├── src/
│   ├── users/                    # Users feature module (all user-related code)
│   │   ├── dto/                  # Data Transfer Objects — define request body shapes
│   │   │   ├── create-user.dto.ts   # Fields + validation rules for POST /users
│   │   │   └── update-user.dto.ts   # Same fields but all optional for PUT /users/:id
│   │   ├── entities/             # TypeORM entities — map to database tables
│   │   │   └── user.entity.ts       # Defines the "users" table schema
│   │   ├── users.controller.ts   # HTTP layer — routes, status codes, param parsing
│   │   ├── users.service.ts      # Business logic — CRUD operations, error handling
│   │   └── users.module.ts       # Module definition — wires controller + service
│   ├── health/                   # Health check feature module
│   │   ├── health.controller.ts  # GET /health — checks DB connectivity
│   │   └── health.module.ts      # Module definition for health feature
│   ├── app.module.ts             # Root module — imports all feature modules + DB config
│   └── main.ts                   # Entry point — bootstraps app, applies global pipes
├── package.json                  # Dependencies and npm scripts
├── tsconfig.json                 # TypeScript compiler options
├── Dockerfile                    # Multi-stage build for production images
├── docker-compose.yml            # Local dev: PostgreSQL + NestJS app containers
├── .env.example                  # Template for environment variables (safe to commit)
├── .dockerignore                 # Files excluded from Docker build context
├── .gitignore                    # Files excluded from git
└── README.md                     # This file
```

**Key concepts:**

- **Module** — groups related controllers, services, and providers. Enforces encapsulation.
- **Controller** — handles HTTP requests. Extracts params/body, calls Service, returns response.
- **Service** — contains business logic. Talks to the Repository. Throws HTTP exceptions.
- **Entity** — a TypeScript class decorated with TypeORM decorators that maps to a DB table.
- **DTO** — a class describing the expected shape of incoming request data, with validation decorators.
- **Repository** — TypeORM's data-access abstraction. Provides `find`, `save`, `remove`, etc.

---

## Local Development Setup (without Docker)

### Prerequisites

- Node.js >= 20
- PostgreSQL running locally (or use Docker just for DB)

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Create your .env file from the template
cp .env.example .env

# 3. Edit .env with your local PostgreSQL credentials
#    Set DB_HOST=localhost if running PostgreSQL locally
nano .env

# 4. Start the development server with hot-reload
npm run start:dev
```

The application will be available at `http://localhost:3000`.

With `synchronize: true` in the TypeORM config, the `users` table is created automatically on first start.

---

## Docker Setup (Recommended)

Docker Compose starts both PostgreSQL and the NestJS app with a single command.

```bash
# 1. Copy the environment file
cp .env.example .env

# 2. Build the NestJS image and start all services
docker compose up --build

# Run in detached (background) mode
docker compose up --build -d

# View logs
docker compose logs -f web
docker compose logs -f db

# Stop all services (data is preserved in the named volume)
docker compose down

# Stop and DELETE all data (removes the postgres_data volume)
docker compose down -v
```

**What happens on `docker compose up`:**

1. Docker builds the NestJS image using the multi-stage Dockerfile
2. The `db` service (PostgreSQL) starts and runs its healthcheck
3. Once the DB is healthy, the `web` service starts
4. TypeORM auto-creates the `users` table (synchronize: true)
5. App is ready at `http://localhost:3000`

---

## API Endpoints

Base URL: `http://localhost:3000`

### Health

| Method | Path      | Description                        | Success Code |
|--------|-----------|------------------------------------|--------------|
| GET    | /health   | Check app and database connectivity | 200          |

### Users

| Method | Path         | Description              | Success Code |
|--------|--------------|--------------------------|--------------|
| GET    | /users       | List all users           | 200          |
| POST   | /users       | Create a new user        | 201          |
| GET    | /users/:id   | Get a single user by ID  | 200          |
| PUT    | /users/:id   | Update a user (partial)  | 200          |
| DELETE | /users/:id   | Delete a user            | 204          |

---

## curl Examples

### Check Health

```bash
curl http://localhost:3000/health
```

Response (200 OK):
```json
{
  "status": "ok",
  "database": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Create a User

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Smith",
    "email": "alice@example.com",
    "role": "admin"
  }'
```

Response (201 Created):
```json
{
  "id": 1,
  "name": "Alice Smith",
  "email": "alice@example.com",
  "role": "admin",
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### List All Users

```bash
curl http://localhost:3000/users
```

### Get a Single User

```bash
curl http://localhost:3000/users/1
```

Response (404 Not Found if user doesn't exist):
```json
{
  "statusCode": 404,
  "message": "User with id 99 not found",
  "error": "Not Found"
}
```

### Update a User (partial update)

```bash
curl -X PUT http://localhost:3000/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "role": "moderator",
    "isActive": false
  }'
```

### Delete a User

```bash
curl -X DELETE http://localhost:3000/users/1
# Returns 204 No Content (empty response body)
```

### Validation Error Example

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "", "email": "not-an-email", "role": "superadmin"}'
```

Response (400 Bad Request):
```json
{
  "statusCode": 400,
  "message": [
    "name should not be empty",
    "email must be an email",
    "role must be one of the following values: admin, user, moderator"
  ],
  "error": "Bad Request"
}
```

---

## Environment Variables

| Variable      | Default      | Description                                                     |
|---------------|--------------|-----------------------------------------------------------------|
| `PORT`        | `3000`       | HTTP port the NestJS server listens on                          |
| `DEBUG`       | `false`      | Set to `true` to enable TypeORM SQL query logging               |
| `DB_HOST`     | `db`         | PostgreSQL hostname (`db` for Docker, `localhost` for local dev)|
| `DB_PORT`     | `5432`       | PostgreSQL port                                                 |
| `DB_USER`     | `nestuser`   | PostgreSQL username                                             |
| `DB_PASSWORD` | `nestpassword`| PostgreSQL password (use a strong secret in production)        |
| `DB_NAME`     | `usersdb`    | PostgreSQL database name                                        |

---

## Key NestJS Concepts

### Decorators

NestJS is built on TypeScript decorators — metadata annotations that modify class/method behavior:

```typescript
@Controller('users')   // Marks class as a controller, sets route prefix
@Get(':id')            // Maps GET /users/:id to this method
@Injectable()          // Marks class as injectable into the DI container
@Entity('users')       // Maps class to the "users" database table
@Column({ unique: true }) // Maps property to a DB column with UNIQUE constraint
```

Decorators are processed at runtime by NestJS's reflection system. This requires `emitDecoratorMetadata: true` and `experimentalDecorators: true` in `tsconfig.json`.

### Modules and Dependency Injection

NestJS uses an IoC (Inversion of Control) container. Instead of classes creating their own dependencies with `new`, they declare what they need and NestJS provides it:

```typescript
// Without DI (manual, tightly coupled)
class UsersController {
  private service = new UsersService(new Repository(...)); // you manage everything
}

// With NestJS DI (loosely coupled, testable)
class UsersController {
  constructor(private usersService: UsersService) {}  // NestJS provides it
}
```

Benefits: easy testing (swap real service for a mock), single instances by default (singleton scope), clear dependency graph.

### DTOs and ValidationPipe

DTOs define the contract for incoming data. `ValidationPipe` enforces it at runtime:

```typescript
// Without ValidationPipe — raw, unvalidated request body
app.post('/users', (req, res) => {
  const { name, email } = req.body; // could be anything!
});

// With NestJS DTOs + ValidationPipe — validated and typed
@Post()
create(@Body() dto: CreateUserDto) {
  // dto.name is guaranteed to be a non-empty string <= 100 chars
  // dto.email is guaranteed to be a valid email
  // any extra fields are stripped (whitelist: true)
}
```

### TypeORM Repository Pattern

TypeORM's `Repository<T>` provides a clean abstraction over SQL:

```typescript
// TypeORM                          // Equivalent SQL
repository.find()                   // SELECT * FROM users
repository.findOneBy({ id: 1 })     // SELECT * FROM users WHERE id = 1
repository.save(user)               // INSERT INTO users ... / UPDATE users ...
repository.remove(user)             // DELETE FROM users WHERE id = 1
```

---

## Production Considerations

This project is configured for development convenience (`synchronize: true`). Before deploying to production:

1. **Disable synchronize** — set `synchronize: false` in `app.module.ts`
2. **Use migrations** — generate TypeORM migrations to safely evolve the schema
3. **Strong secrets** — use a secrets manager (AWS Secrets Manager, Vault) for DB credentials
4. **Connection pooling** — configure `extra: { max: 10 }` in TypeORM options
5. **HTTPS** — terminate TLS at a load balancer or reverse proxy (nginx, AWS ALB)
6. **Logging** — integrate a structured logger (Pino, Winston) instead of console.log

---

## Screenshots

_Add screenshots of the API running here after setup._

Example placeholders:
- `GET /health` response in browser or Postman
- `POST /users` creating a user
- `GET /users` listing all users
- Docker Desktop showing running containers
