# Contact Manager — Angular 17 + Spring Boot 3 + PostgreSQL

A full-stack Contact Manager application built with a modern three-tier architecture: Angular 17 standalone components on the frontend, Spring Boot 3 REST API on the backend, and PostgreSQL for persistent storage. Everything runs in Docker with a single command.

---

## 1. Project Overview

The Contact Manager lets you create, view, and delete contacts. Each contact has a name, email, optional phone number, optional company, and an active status. The frontend communicates with the backend through a RESTful JSON API.

Key design decisions:
- Angular 17 standalone components (no NgModules) for a leaner, more modern app structure
- Spring Boot layered architecture: Controller -> Service -> Repository -> Database
- nginx serves the Angular SPA in production and proxies `/api` to Spring Boot
- Docker Compose orchestrates all three services with health checks and proper startup order

---

## 2. Tech Stack

| Layer       | Technology                           | Version  |
|-------------|--------------------------------------|----------|
| Frontend    | Angular (standalone components)      | 17.2     |
| Language    | TypeScript                           | 5.3      |
| HTTP Client | Angular HttpClient + RxJS Observables| 7.8      |
| Backend     | Spring Boot                          | 3.2.3    |
| ORM         | Spring Data JPA + Hibernate          | 6.x      |
| Database    | PostgreSQL                           | 16       |
| Web Server  | nginx (SPA host + reverse proxy)     | alpine   |
| Container   | Docker + Docker Compose              | latest   |
| Build       | Maven (backend), Node/npm (frontend) | —        |

---

## 3. Architecture

```
Browser
  |
  | HTTP :4200
  v
+------------------+
|   nginx (Docker) |   Serves Angular SPA (index.html)
|   port 80        |   Proxies /api/** → Spring Boot
+------------------+
  |
  | HTTP :8080  (proxy_pass)
  v
+------------------+
| Spring Boot API  |   REST endpoints: /api/v1/contacts
| port 8080        |   Spring Data JPA
+------------------+
  |
  | JDBC :5432
  v
+------------------+
| PostgreSQL 16    |   contacts table (auto-created by Hibernate)
| port 5432        |
+------------------+
```

### Angular Standalone Components vs NgModules

Angular 17 introduces standalone components as the default. Instead of declaring components inside an NgModule, each component declares its own `imports` array:

```typescript
@Component({
  selector: 'app-contact-list',
  standalone: true,            // No NgModule needed
  imports: [CommonModule, ContactItemComponent],  // Direct imports
  templateUrl: './contact-list.component.html',
})
```

This makes components independently portable and tree-shakeable.

---

## 4. Folder Structure

```
angular-springboot/
├── backend/                          # Spring Boot application
│   └── src/main/java/com/example/contacts/
│       ├── controller/               # HTTP request handlers (@RestController)
│       ├── model/                    # JPA entities (@Entity)
│       ├── repository/               # Data access (JpaRepository)
│       ├── service/                  # Business logic (@Service)
│       └── exception/                # Custom exceptions + global handler
├── frontend/                         # Angular application
│   └── src/app/
│       ├── models/                   # TypeScript interfaces (Contact)
│       ├── services/                 # HTTP calls (ContactService)
│       └── components/               # UI components
│           ├── contact-form/         # New contact creation form
│           ├── contact-list/         # Renders the list of contacts
│           └── contact-item/         # Single contact card
├── docker-compose.yml                # Orchestrates all 3 services
└── .env.example                      # Environment variable template
```

**Backend layered architecture**: Request arrives at Controller, which delegates to Service (business logic), which calls Repository (database queries). This separation makes each layer independently testable.

**Frontend Angular conventions**: Services fetch data; components display it. Parent components own state and pass it down via `@Input()`. Children send events up via `@Output()` EventEmitters.

---

## 5. Local Development (without Docker)

### Backend

Requirements: Java 17, Maven 3.9+, PostgreSQL running locally.

```bash
cd backend

# Set environment variables (or export them)
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=contactsdb
export DB_USER=contactuser
export DB_PASSWORD=contactpassword

# Run the Spring Boot app
mvn spring-boot:run
```

Backend available at: http://localhost:8080

### Frontend

Requirements: Node 20+, npm.

```bash
cd frontend

# Install dependencies
npm install

# Start dev server (uses proxy.conf.json to forward /api to localhost:8080)
npm start
```

Frontend available at: http://localhost:4200

The `proxy.conf.json` forwards `/api/*` requests to `http://backend:8080` in Docker, and to `http://localhost:8080` when you override the target for local development.

---

## 6. Docker Setup (Recommended)

```bash
# 1. Clone and enter the project directory
cd angular-springboot

# 2. Copy and edit environment variables
cp .env.example .env
# Edit .env if you want to change passwords (optional for local use)

# 3. Build and start all services
docker compose up --build

# Run in the background
docker compose up --build -d
```

Open http://localhost:4200 in your browser.

```bash
# Stop all services
docker compose down

# Stop and remove all data (volumes)
docker compose down -v
```

---

## 7. API Endpoints

### Health Check

| Method | Path      | Description                         |
|--------|-----------|-------------------------------------|
| GET    | /health   | Returns service and database status |

### Contacts Resource

| Method | Path                     | Description              |
|--------|--------------------------|--------------------------|
| GET    | /api/v1/contacts         | List all contacts        |
| POST   | /api/v1/contacts         | Create a new contact     |
| GET    | /api/v1/contacts/{id}    | Get a contact by ID      |
| PUT    | /api/v1/contacts/{id}    | Update a contact         |
| DELETE | /api/v1/contacts/{id}    | Delete a contact         |

### Response Format

```json
{
  "id": 1,
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+1 555 000 0000",
  "company": "Acme Corp",
  "active": true,
  "createdAt": "2024-03-01T10:00:00",
  "updatedAt": "2024-03-01T10:00:00"
}
```

---

## 8. curl Examples

```bash
# Health check
curl http://localhost:8080/health

# List all contacts
curl http://localhost:8080/api/v1/contacts

# Create a contact
curl -X POST http://localhost:8080/api/v1/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+1 555 000 0000",
    "company": "Acme Corp",
    "active": true
  }'

# Get a contact by ID
curl http://localhost:8080/api/v1/contacts/1

# Update a contact
curl -X PUT http://localhost:8080/api/v1/contacts/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "active": true
  }'

# Delete a contact
curl -X DELETE http://localhost:8080/api/v1/contacts/1
```

---

## 9. Environment Variables

| Variable       | Default                   | Description                            |
|----------------|---------------------------|----------------------------------------|
| PORT           | 8080                      | Spring Boot server port                |
| DB_HOST        | db                        | PostgreSQL hostname (Docker service)   |
| DB_PORT        | 5432                      | PostgreSQL port                        |
| DB_NAME        | contactsdb                | Database name                          |
| DB_USER        | contactuser               | Database username                      |
| DB_PASSWORD    | contactpassword           | Database password                      |
| FRONTEND_URL   | http://localhost:4200     | Allowed CORS origin for the API        |
| JPA_SHOW_SQL   | false                     | Print SQL queries to logs (debug only) |

---

## 10. Key Angular 17 Concepts Used

### Standalone Components
Each component is self-contained with its own `imports`. No `app.module.ts` needed.

```typescript
@Component({ standalone: true, imports: [CommonModule, FormsModule], ... })
```

### HttpClient & Observables
`HttpClient` returns `Observable<T>` — lazy async streams. You must call `.subscribe()` to trigger the HTTP request.

```typescript
this.contactService.getAll().subscribe({
  next: (data) => { this.contacts = data; },
  error: (err) => { this.error = 'Failed to load'; }
});
```

### @Input() and @Output() — Component Communication
Data flows **down** from parent to child via `@Input()`. Events flow **up** from child to parent via `@Output()` + `EventEmitter`.

```typescript
// Child component
@Input() contact!: Contact;             // Receives data from parent
@Output() deleted = new EventEmitter<number>();  // Sends event to parent
```

### *ngFor and *ngIf — Structural Directives
`*ngFor` iterates arrays in templates. `*ngIf` conditionally renders elements.

```html
<app-contact-item *ngFor="let c of contacts" [contact]="c"></app-contact-item>
<div *ngIf="loading">Loading...</div>
```

### Template-Driven Forms (FormsModule)
`[(ngModel)]` provides two-way binding between form inputs and component properties.

```html
<input [(ngModel)]="model.name" name="name" required>
```

### Services & Dependency Injection
`@Injectable({ providedIn: 'root' })` registers a singleton service. Angular's DI system injects it via the constructor.

```typescript
constructor(private contactService: ContactService) {}
```

---

## 11. Screenshots

_Add screenshots here after running the application._

- `docs/screenshot-contact-list.png` — Main contact list view
- `docs/screenshot-add-contact.png` — Contact creation form
