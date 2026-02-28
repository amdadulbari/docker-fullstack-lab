/*
 * Services/IProductService.cs
 * ────────────────────────────
 * Interface for the product business logic layer.
 *
 * Defining an interface alongside the implementation is a core .NET pattern:
 *
 *   1. Dependency Inversion — controllers depend on the abstraction (interface),
 *      not the concrete class. This makes the code loosely coupled.
 *
 *   2. Testability — in unit tests, you can swap the real service with a mock
 *      that implements this interface, without touching the database.
 *
 *   3. ASP.NET Core DI — services are registered as:
 *        builder.Services.AddScoped<IProductService, ProductService>();
 *      The DI container injects the concrete class wherever the interface is needed.
 */

using DotnetPostgres.DTOs;

namespace DotnetPostgres.Services;

public interface IProductService
{
    Task<IEnumerable<ProductResponseDto>> GetAllAsync(int skip, int limit);
    Task<ProductResponseDto?>             GetByIdAsync(int id);
    Task<ProductResponseDto>              CreateAsync(ProductCreateDto dto);
    Task<ProductResponseDto?>             UpdateAsync(int id, ProductUpdateDto dto);
    Task<bool>                            DeleteAsync(int id);
}
