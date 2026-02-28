/*
 * Data/AppDbContext.cs
 * ─────────────────────
 * AppDbContext is the bridge between your C# code and the PostgreSQL database.
 * It inherits from EF Core's DbContext and is responsible for:
 *
 *   1. Exposing DbSet<T> properties — one per entity/table
 *   2. Configuring the schema via the Fluent API (OnModelCreating)
 *   3. Tracking entity changes and translating them to SQL
 *
 * Registered as a scoped service in Program.cs, so each HTTP request
 * gets its own DbContext instance (and therefore its own DB connection).
 */

using DotnetPostgres.Models;
using Microsoft.EntityFrameworkCore;

namespace DotnetPostgres.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    // ── Tables ────────────────────────────────────────────────────
    // DbSet<Product> → EF Core maps this to a "Products" table.
    // Using expression-bodied property for conciseness.
    public DbSet<Product> Products => Set<Product>();

    // ── Schema Configuration (Fluent API) ─────────────────────────
    // The Fluent API is the recommended way to configure EF Core.
    // It keeps model classes (Models/) free of framework attributes.
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>(entity =>
        {
            // Table name (EF Core would default to "Products" — being explicit)
            entity.ToTable("products");

            // Primary key
            entity.HasKey(e => e.Id);

            // Column configurations
            entity.Property(e => e.Id)
                  .HasColumnName("id")
                  .UseIdentityAlwaysColumn();   // PostgreSQL GENERATED ALWAYS AS IDENTITY

            entity.Property(e => e.Name)
                  .HasColumnName("name")
                  .HasMaxLength(255)
                  .IsRequired();

            entity.Property(e => e.Description)
                  .HasColumnName("description");

            // NUMERIC(10, 2): up to 10 digits total, 2 after the decimal point
            entity.Property(e => e.Price)
                  .HasColumnName("price")
                  .HasPrecision(10, 2)
                  .IsRequired();

            entity.Property(e => e.Stock)
                  .HasColumnName("stock")
                  .IsRequired();

            entity.Property(e => e.Available)
                  .HasColumnName("available")
                  .HasDefaultValue(true);

            // HasDefaultValueSql → the default is set by PostgreSQL, not EF Core.
            // This ensures consistent timestamps even if the app clock drifts.
            entity.Property(e => e.CreatedAt)
                  .HasColumnName("created_at")
                  .HasDefaultValueSql("NOW()")
                  .ValueGeneratedOnAdd();

            entity.Property(e => e.UpdatedAt)
                  .HasColumnName("updated_at");

            // Index for common query patterns
            entity.HasIndex(e => e.Name);
            entity.HasIndex(e => e.Available);
        });
    }
}
