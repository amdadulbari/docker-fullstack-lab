/*
 * Services/ProductService.cs
 * ───────────────────────────
 * Implements the business logic for the Product resource.
 * All database access goes through EF Core's AppDbContext.
 *
 * Key EF Core concepts used here:
 *
 *   DbContext.Products         → IQueryable<Product>, represents the "products" table
 *   AsNoTracking()             → tells EF Core not to track the entity after fetching it.
 *                                Faster for read-only queries; no snapshot overhead.
 *   ToListAsync()              → executes the query and returns a List<T>
 *   FindAsync(id)              → fetches by primary key; uses the identity cache first
 *   Entry(entity).State        → marks the entity's state (Modified) for EF Core's change tracker
 *   SaveChangesAsync()         → flushes all pending changes to the database as a single transaction
 */

using DotnetPostgres.Data;
using DotnetPostgres.DTOs;
using DotnetPostgres.Models;
using Microsoft.EntityFrameworkCore;

namespace DotnetPostgres.Services;

public class ProductService(AppDbContext db) : IProductService
{
    // ── List All (with pagination) ─────────────────────────────────
    public async Task<IEnumerable<ProductResponseDto>> GetAllAsync(int skip, int limit)
    {
        return await db.Products
            .AsNoTracking()                       // read-only → no change tracking overhead
            .OrderByDescending(p => p.CreatedAt)  // newest first
            .Skip(skip)
            .Take(limit)
            .Select(p => ToDto(p))                // project to DTO in SQL (avoids loading full entity)
            .ToListAsync();
    }

    // ── Get Single ────────────────────────────────────────────────
    public async Task<ProductResponseDto?> GetByIdAsync(int id)
    {
        var product = await db.Products
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id);

        return product is null ? null : ToDto(product);
    }

    // ── Create ────────────────────────────────────────────────────
    public async Task<ProductResponseDto> CreateAsync(ProductCreateDto dto)
    {
        var product = new Product
        {
            Name        = dto.Name,
            Description = dto.Description,
            Price       = dto.Price,
            Stock       = dto.Stock,
            Available   = dto.Available,
            // CreatedAt is set by PostgreSQL's NOW() default — we don't set it here
        };

        db.Products.Add(product);
        await db.SaveChangesAsync();

        // After SaveChangesAsync, EF Core has populated Id and CreatedAt
        // from the database (via a RETURNING clause in the INSERT statement)
        return ToDto(product);
    }

    // ── Update ────────────────────────────────────────────────────
    public async Task<ProductResponseDto?> UpdateAsync(int id, ProductUpdateDto dto)
    {
        // FindAsync uses the primary key — checks the identity cache first,
        // then hits the database if the entity isn't already loaded.
        var product = await db.Products.FindAsync(id);
        if (product is null) return null;

        // Only update fields that were actually sent (non-null in the DTO).
        // This is the .NET equivalent of Pydantic's exclude_unset=True.
        if (dto.Name        is not null) product.Name        = dto.Name;
        if (dto.Description is not null) product.Description = dto.Description;
        if (dto.Price       is not null) product.Price       = dto.Price.Value;
        if (dto.Stock       is not null) product.Stock       = dto.Stock.Value;
        if (dto.Available   is not null) product.Available   = dto.Available.Value;

        product.UpdatedAt = DateTime.UtcNow;

        // EF Core's change tracker detected the modifications above.
        // SaveChangesAsync emits: UPDATE products SET ... WHERE id = @id
        await db.SaveChangesAsync();

        return ToDto(product);
    }

    // ── Delete ────────────────────────────────────────────────────
    public async Task<bool> DeleteAsync(int id)
    {
        var product = await db.Products.FindAsync(id);
        if (product is null) return false;

        db.Products.Remove(product);
        await db.SaveChangesAsync();
        return true;
    }

    // ── Mapping Helper ────────────────────────────────────────────
    // A private static method to convert a Product entity → ProductResponseDto.
    // In larger projects, use a dedicated mapping library like AutoMapper or Mapster.
    private static ProductResponseDto ToDto(Product p) => new(
        p.Id,
        p.Name,
        p.Description,
        p.Price,
        p.Stock,
        p.Available,
        p.CreatedAt,
        p.UpdatedAt
    );
}
