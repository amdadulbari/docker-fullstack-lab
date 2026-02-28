/*
 * Models/Product.cs
 * ─────────────────
 * The Product entity maps directly to the "products" table in PostgreSQL.
 *
 * In EF Core, a plain C# class (POCO) becomes a table row.
 * Column names, types, and constraints are configured either:
 *   a) via Data Annotations (attributes on properties), or
 *   b) via Fluent API (in AppDbContext.OnModelCreating)
 *
 * This project uses the Fluent API (in Data/AppDbContext.cs) to keep
 * model classes clean and free of framework-specific attributes.
 */

namespace DotnetPostgres.Models;

public class Product
{
    // ── Primary Key ───────────────────────────────────────────────
    // EF Core recognises 'Id' by convention and treats it as the PK.
    // PostgreSQL generates the value via SERIAL / IDENTITY.
    public int Id { get; set; }

    // ── Fields ────────────────────────────────────────────────────
    public string Name { get; set; } = string.Empty;

    // Nullable string → the column is nullable in PostgreSQL
    public string? Description { get; set; }

    // decimal maps to PostgreSQL NUMERIC — exact arithmetic, no floating-point errors.
    // Precision/scale configured in AppDbContext (10 digits, 2 decimal places).
    public decimal Price { get; set; }

    public int Stock { get; set; }

    public bool Available { get; set; } = true;

    // ── Timestamps ────────────────────────────────────────────────
    // Server-generated: PostgreSQL's NOW() sets these, not the application.
    // This ensures consistent timestamps regardless of the app server's clock.
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
