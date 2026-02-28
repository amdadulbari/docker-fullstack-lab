# Products API — ASP.NET Core 8 + PostgreSQL

A production-structured REST API demonstrating ASP.NET Core 8 Web API, Entity Framework Core,
PostgreSQL, and Docker — built as part of the `docker-fullstack-lab` collection for DevOps engineers.

---

## Tech Stack

| Layer       | Technology                              |
|-------------|-----------------------------------------|
| Framework   | ASP.NET Core 8 Web API                  |
| ORM         | Entity Framework Core 8 + Npgsql        |
| Database    | PostgreSQL 16                           |
| API Docs    | Swagger UI (Swashbuckle)                |
| Runtime     | .NET 8                                  |
| Container   | Docker (multi-stage build)              |

---

## Project Structure

```
dotnet-postgres/
├── Controllers/
│   ├── HealthController.cs      # GET /health
│   └── ProductsController.cs   # CRUD /api/v1/products
├── Data/
│   └── AppDbContext.cs          # EF Core DbContext + schema config (Fluent API)
├── DTOs/
│   └── ProductDto.cs            # Request/response data shapes (C# records)
├── Models/
│   └── Product.cs               # EF Core entity (maps to "products" table)
├── Services/
│   ├── IProductService.cs       # Interface (enables DI + testability)
│   └── ProductService.cs        # Business logic + EF Core queries
├── Program.cs                   # DI registration + HTTP pipeline setup
├── appsettings.json
├── dotnet-postgres.csproj
├── Dockerfile
└── docker-compose.yml
```

---

## Quick Start

```bash
cp .env.example .env
docker compose up --build
```

The API is available at **http://localhost:8085**
Swagger UI is available at **http://localhost:8085/swagger**

---

## API Endpoints

| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| GET    | `/health`                   | App + database health    |
| GET    | `/api/v1/products`          | List all products        |
| GET    | `/api/v1/products/{id}`     | Get product by ID        |
| POST   | `/api/v1/products`          | Create a product         |
| PUT    | `/api/v1/products/{id}`     | Update a product         |
| DELETE | `/api/v1/products/{id}`     | Delete a product         |

### Example Requests

```bash
# Health check
curl http://localhost:8085/health

# Create a product
curl -X POST http://localhost:8085/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Widget","description":"A fine widget","price":9.99,"stock":100}'

# List products (with pagination)
curl "http://localhost:8085/api/v1/products?skip=0&limit=10"

# Get by ID
curl http://localhost:8085/api/v1/products/1

# Update
curl -X PUT http://localhost:8085/api/v1/products/1 \
  -H "Content-Type: application/json" \
  -d '{"price":12.99,"stock":80}'

# Delete
curl -X DELETE http://localhost:8085/api/v1/products/1
```

---

## Environment Variables

| Variable      | Default         | Description                                      |
|---------------|-----------------|--------------------------------------------------|
| `DB_HOST`     | `db`            | PostgreSQL host (`db` in Docker, `localhost` locally) |
| `DB_PORT`     | `5432`          | PostgreSQL port                                  |
| `DB_NAME`     | `productdb`     | Database name                                    |
| `DB_USER`     | `productuser`   | Database user                                    |
| `DB_PASSWORD` | `productpassword` | Database password                              |

---

## Key Concepts

### Dependency Injection
ASP.NET Core has a built-in DI container. Services are registered in `Program.cs` and injected via constructor parameters:
- `AppDbContext` → scoped (one per request)
- `IProductService` / `ProductService` → scoped

### Entity Framework Core
EF Core is a .NET ORM. The `AppDbContext` class maps C# models to PostgreSQL tables using the **Fluent API** (`OnModelCreating`). `EnsureCreatedAsync()` auto-creates the schema on startup — no manual migrations needed for this demo.

### Multi-Stage Docker Build
The `Dockerfile` uses two stages:
1. **`builder`** — `mcr.microsoft.com/dotnet/sdk:8.0` (~800 MB) restores packages and compiles the app
2. **`production`** — `mcr.microsoft.com/dotnet/aspnet:8.0` (~220 MB) runs only the published output

This produces a lean final image with no SDK or source code included.

### Ports

| Port (host) | Port (container) | Service    |
|-------------|------------------|------------|
| 8085        | 8080             | ASP.NET Core API |
| 5439        | 5432             | PostgreSQL |
