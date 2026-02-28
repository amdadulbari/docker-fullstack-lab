/*
 * Program.cs — Application Entry Point
 * ──────────────────────────────────────
 * ASP.NET Core 8 uses a minimal hosting model (no Startup.cs).
 * Everything is configured here in two phases:
 *
 *   Phase 1 — Register services into the DI container  (builder.Services.Add*)
 *   Phase 2 — Build the app and configure the HTTP pipeline (app.Use*, app.Map*)
 *
 * The DI container resolves dependencies automatically:
 *   When ProductsController is requested, the container sees it needs
 *   IProductService → injects ProductService → which needs AppDbContext → injects it.
 */

using DotnetPostgres.Data;
using DotnetPostgres.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ══════════════════════════════════════════════════════════════════
// PHASE 1: Register Services
// ══════════════════════════════════════════════════════════════════

// ── Database Connection ───────────────────────────────────────────
// Read individual DB parts from environment variables (same pattern as other projects).
// In Docker Compose these come from the .env file via env_file directive.
var dbHost     = builder.Configuration["DB_HOST"]     ?? "db";
var dbPort     = builder.Configuration["DB_PORT"]     ?? "5432";
var dbName     = builder.Configuration["DB_NAME"]     ?? "productdb";
var dbUser     = builder.Configuration["DB_USER"]     ?? "productuser";
var dbPassword = builder.Configuration["DB_PASSWORD"] ?? "productpassword";

var connectionString = $"Host={dbHost};Port={dbPort};Database={dbName};Username={dbUser};Password={dbPassword}";

// AddDbContext<T> registers AppDbContext as a scoped service.
// Scoped = one instance per HTTP request (the right lifetime for a DbContext).
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString)
);

// ── Application Services ──────────────────────────────────────────
// Scoped lifetime: created once per request, disposed at end of request.
// The controller receives IProductService; the container injects ProductService.
builder.Services.AddScoped<IProductService, ProductService>();

// ── Controllers + Swagger ─────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new()
    {
        Title       = "Products API",
        Version     = "v1",
        Description = "A simple Products API demonstrating ASP.NET Core 8, " +
                      "EF Core, PostgreSQL, and Docker.",
    });
});


// ══════════════════════════════════════════════════════════════════
// PHASE 2: Build and Configure the HTTP Pipeline
// ══════════════════════════════════════════════════════════════════
var app = builder.Build();

// ── Auto-migrate Database on Startup ─────────────────────────────
// EnsureCreated() creates the schema from the EF Core model if it doesn't exist yet.
// Equivalent to FastAPI's create_all() — suitable for demos and development.
// In production, replace with proper EF Core Migrations (dotnet ef migrations).
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.EnsureCreatedAsync();
}

// ── Swagger UI ────────────────────────────────────────────────────
// Available at http://localhost:8080/swagger
app.UseSwagger();
app.UseSwaggerUI();

// ── Route to Controllers ──────────────────────────────────────────
app.MapControllers();

app.Run();
