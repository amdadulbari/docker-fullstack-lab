/*
 * DTOs/ProductDto.cs
 * ───────────────────
 * Data Transfer Objects define the API contract — what the client sends
 * and receives. They are intentionally separate from the ORM model:
 *
 *   Product (Model)         → EF Core entity, maps to the database table
 *   ProductCreateDto        → Fields accepted when creating a product (POST)
 *   ProductUpdateDto        → Fields accepted when updating (PUT) — all optional
 *   ProductResponseDto      → Shape of every API response (includes id + timestamps)
 *
 * Using C# records gives us:
 *   - Immutability by default (no accidental mutation)
 *   - Value-based equality
 *   - Concise syntax (no boilerplate getters/setters)
 *
 * ASP.NET Core + Swagger reads these types to generate the OpenAPI spec automatically.
 */

using System.ComponentModel.DataAnnotations;

namespace DotnetPostgres.DTOs;


// ── Create (POST body) ────────────────────────────────────────────────────────
public record ProductCreateDto(
    [Required]
    [StringLength(255, MinimumLength = 1)]
    string Name,

    string? Description,

    [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0")]
    decimal Price,

    [Range(0, int.MaxValue, ErrorMessage = "Stock cannot be negative")]
    int Stock,

    bool Available = true
);


// ── Update (PUT body) — every field optional for partial updates ───────────────
public record ProductUpdateDto(
    [StringLength(255, MinimumLength = 1)]
    string? Name,

    string? Description,

    [Range(0.01, double.MaxValue)]
    decimal? Price,

    [Range(0, int.MaxValue)]
    int? Stock,

    bool? Available
);


// ── Response — returned by every endpoint ─────────────────────────────────────
public record ProductResponseDto(
    int      Id,
    string   Name,
    string?  Description,
    decimal  Price,
    int      Stock,
    bool     Available,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);
