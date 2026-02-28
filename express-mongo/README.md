# express-mongo-products

A production-structured REST API for managing products, built with Node.js, Express, and MongoDB.

---

## 1. Project Overview

This project demonstrates a clean, beginner-friendly Node.js API following the **Controller → Model → Database** pattern. It exposes full CRUD (Create, Read, Update, Delete) operations for a `products` resource, backed by MongoDB through the Mongoose ODM.

Key goals:
- Clear folder structure that scales to larger projects
- Educational comments on every important concept
- Docker-first workflow — one command to run the entire stack
- Consistent JSON responses and proper HTTP status codes throughout

---

## 2. Tech Stack

| Technology   | Version | Role                                      |
|--------------|---------|-------------------------------------------|
| Node.js      | 20 LTS  | JavaScript runtime                        |
| Express      | 4.x     | HTTP server and routing framework         |
| Mongoose     | 8.x     | MongoDB ODM — schema, validation, queries |
| MongoDB      | 7.x     | Document database (runs in Docker)        |
| Morgan       | 1.x     | HTTP request logger middleware            |
| dotenv       | 16.x    | Loads `.env` variables into `process.env` |
| Docker       | —       | Container runtime                         |
| Docker Compose | —     | Multi-container orchestration             |

---

## 3. Architecture

```
┌──────────────────────────────────────────────────────────┐
│                        Client                            │
│            (curl / Postman / Frontend app)               │
└───────────────────────────┬──────────────────────────────┘
                            │  HTTP Request
                            ▼
┌──────────────────────────────────────────────────────────┐
│                    Express App (app.js)                  │
│                                                          │
│  Middleware chain:                                       │
│    express.json()  →  morgan('dev')  →  Routes          │
│                                                          │
│  ┌─────────────────┐      ┌──────────────────────────┐  │
│  │  health.routes  │      │    product.routes        │  │
│  │  GET /health    │      │  GET/POST /products      │  │
│  └─────────────────┘      │  GET/PUT/DELETE /:id     │  │
│                           └────────────┬─────────────┘  │
│                                        │                 │
│                           ┌────────────▼─────────────┐  │
│                           │  product.controller       │  │
│                           │  (business logic)         │  │
│                           └────────────┬─────────────┘  │
└────────────────────────────────────────┼─────────────────┘
                                         │  Mongoose ODM
                            ┌────────────▼─────────────┐
                            │   product.model          │
                            │   (Mongoose Schema)      │
                            └────────────┬─────────────┘
                                         │
                            ┌────────────▼─────────────┐
                            │        MongoDB           │
                            │   (productsdb database)  │
                            └──────────────────────────┘
```

**Request lifecycle:**
1. Client sends an HTTP request (e.g., `POST /api/v1/products`)
2. Express middleware parses the JSON body and logs the request via Morgan
3. The matching route delegates to the controller function
4. The controller calls a Mongoose model method (`Product.create()`, etc.)
5. Mongoose validates the data against the schema and queries MongoDB
6. The controller sends back a structured JSON response

---

## 4. Folder Structure

```
express-mongo/
├── src/
│   ├── config/
│   │   └── db.js                  # MongoDB connection (connectDB function)
│   ├── models/
│   │   └── product.model.js       # Mongoose schema & model for Product
│   ├── controllers/
│   │   └── product.controller.js  # CRUD business logic (5 functions)
│   ├── routes/
│   │   ├── health.routes.js       # GET /health — DB liveness check
│   │   └── product.routes.js      # 5 product endpoints wired to controller
│   └── app.js                     # Express app setup, middleware, 404 & error handlers
├── server.js                      # Entry point: load env → connect DB → listen
├── package.json                   # Project metadata and dependencies
├── Dockerfile                     # Multi-stage Docker image definition
├── docker-compose.yml             # MongoDB + Express service definitions
├── .env.example                   # Template for environment variables (safe to commit)
├── .dockerignore                  # Files excluded from Docker build context
├── .gitignore                     # Files excluded from Git
└── README.md                      # This file
```

---

## 5. Local Setup (without Docker)

**Prerequisites:** Node.js 20+ and a locally running MongoDB instance.

```bash
# 1. Install dependencies
npm install

# 2. Create your local environment file
cp .env.example .env

# 3. Edit .env — point MONGODB_URI at your local MongoDB
#    Change 'mongo' to 'localhost':
#    MONGODB_URI=mongodb://localhost:27017/productsdb

# 4. Start the development server (auto-restarts on file changes)
npm run dev

# OR start without nodemon
node server.js
```

The API will be available at `http://localhost:3000`.

---

## 6. Docker Setup (recommended)

**Prerequisites:** Docker Desktop (or Docker Engine + Docker Compose plugin).

```bash
# 1. Copy the environment template
cp .env.example .env

# 2. Build the image and start both services (MongoDB + Express)
docker compose up --build

# Run in detached (background) mode
docker compose up --build -d

# Stop all services
docker compose down

# Stop and remove the persistent volume (wipes all data)
docker compose down -v
```

Both the `mongo` service and the `web` service will start. The API is available at `http://localhost:3000` once the `web` container logs `Server running on port 3000`.

---

## 7. API Endpoints

| Method | Path                     | Description                          |
|--------|--------------------------|--------------------------------------|
| GET    | `/health`                | Health check (server + DB status)    |
| GET    | `/api/v1/products`       | List all products (`?category=` opt) |
| POST   | `/api/v1/products`       | Create a new product                 |
| GET    | `/api/v1/products/:id`   | Get a single product by ID           |
| PUT    | `/api/v1/products/:id`   | Update a product by ID               |
| DELETE | `/api/v1/products/:id`   | Delete a product by ID               |

---

## 8. curl Examples

### Health Check

```bash
curl http://localhost:3000/health
```

```json
{
  "status": "ok",
  "database": "ok",
  "timestamp": "2026-02-27T10:00:00.000Z"
}
```

### Create a Product

```bash
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wireless Headphones",
    "description": "Noise-cancelling over-ear headphones",
    "price": 129.99,
    "category": "electronics",
    "inStock": true
  }'
```

```json
{
  "_id": "65f1a2b3c4d5e6f7a8b9c0d1",
  "name": "Wireless Headphones",
  "description": "Noise-cancelling over-ear headphones",
  "price": 129.99,
  "category": "electronics",
  "inStock": true,
  "createdAt": "2026-02-27T10:00:00.000Z",
  "updatedAt": "2026-02-27T10:00:00.000Z",
  "__v": 0
}
```

### List All Products

```bash
curl http://localhost:3000/api/v1/products
```

```json
{
  "count": 1,
  "products": [
    {
      "_id": "65f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Wireless Headphones",
      "description": "Noise-cancelling over-ear headphones",
      "price": 129.99,
      "category": "electronics",
      "inStock": true,
      "createdAt": "2026-02-27T10:00:00.000Z",
      "updatedAt": "2026-02-27T10:00:00.000Z",
      "__v": 0
    }
  ]
}
```

### List Products Filtered by Category

```bash
curl "http://localhost:3000/api/v1/products?category=electronics"
```

### Get a Single Product

```bash
curl http://localhost:3000/api/v1/products/65f1a2b3c4d5e6f7a8b9c0d1
```

### Update a Product

```bash
curl -X PUT http://localhost:3000/api/v1/products/65f1a2b3c4d5e6f7a8b9c0d1 \
  -H "Content-Type: application/json" \
  -d '{"price": 99.99, "inStock": false}'
```

```json
{
  "_id": "65f1a2b3c4d5e6f7a8b9c0d1",
  "name": "Wireless Headphones",
  "description": "Noise-cancelling over-ear headphones",
  "price": 99.99,
  "category": "electronics",
  "inStock": false,
  "createdAt": "2026-02-27T10:00:00.000Z",
  "updatedAt": "2026-02-27T10:05:00.000Z",
  "__v": 0
}
```

### Delete a Product

```bash
curl -X DELETE http://localhost:3000/api/v1/products/65f1a2b3c4d5e6f7a8b9c0d1
```

```json
{
  "message": "Product deleted"
}
```

### Error Responses

Not found (404):
```json
{ "error": "Product not found" }
```

Invalid ID format (400):
```json
{ "error": "Invalid product ID format" }
```

Validation failure (400):
```json
{ "error": "Product validation failed: price: Price cannot be negative" }
```

---

## 9. Environment Variables

| Variable      | Default                              | Description                              |
|---------------|--------------------------------------|------------------------------------------|
| `NODE_ENV`    | `development`                        | Environment mode (affects error messages)|
| `PORT`        | `3000`                               | Port the HTTP server listens on          |
| `MONGODB_URI` | `mongodb://mongo:27017/productsdb`   | MongoDB connection string                |

> When running locally (without Docker), change `mongo` in the URI to `localhost`.

---

## 10. Key Concepts

### Mongoose Schema
A schema defines the shape, types, and validation rules for documents in a collection. Declaring `required`, `min`, `maxlength`, and `enum` here means invalid data is rejected before it ever reaches the database.

### Controller Pattern
Each HTTP operation is handled by a dedicated function in `product.controller.js`. Routes simply map URLs to these functions — no logic lives in the routes file. This makes controllers independently testable and easy to find.

### Middleware
Express middleware functions receive `(req, res, next)`. They can transform the request, log it, end the response, or pass control to the next function via `next()`. This project uses `express.json()` (body parsing) and `morgan` (logging) as global middleware.

### Error Handler
The 4-argument middleware `(err, req, res, next)` in `app.js` is Express's built-in error-handling convention. Any route that calls `next(err)` or throws inside an async wrapper lands here. Centralising error responses ensures consistent formatting.

### Morgan Logging
Morgan's `'dev'` format outputs a compact line per request:
```
POST /api/v1/products 201 14.321 ms - 245
```
This includes the HTTP method, path, status code, response time, and response size — everything needed for quick debugging.

---

## 11. Screenshots

_Add screenshots of your running API responses here (e.g. from Postman or curl output)._

---
