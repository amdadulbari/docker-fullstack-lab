/*
 * Controllers/ProductsController.cs
 * ────────────────────────────────────
 * Full CRUD for the Product resource.
 * Route: /api/v1/products
 *
 * The controller is intentionally thin — it only handles HTTP concerns:
 *   - Parsing and validating the request
 *   - Calling the service layer
 *   - Returning the appropriate HTTP response
 *
 * All business logic lives in Services/ProductService.cs.
 *
 * ASP.NET Core concepts demonstrated:
 *
 *   [FromQuery]      → binds query string parameters (?skip=0&limit=10)
 *   [FromRoute]      → binds URL segments (/products/{id})
 *   [FromBody]       → binds and validates the JSON request body
 *   CreatedAtAction  → returns 201 with a Location header pointing to the new resource
 *   NoContent()      → returns 204 (no body) for successful deletes
 *   NotFound()       → returns 404 with a problem details body
 */

using DotnetPostgres.DTOs;
using DotnetPostgres.Services;
using Microsoft.AspNetCore.Mvc;

namespace DotnetPostgres.Controllers;

[ApiController]
[Route("api/v1/[controller]")]   // → /api/v1/products
public class ProductsController(IProductService productService) : ControllerBase
{
    // ── GET /api/v1/products?skip=0&limit=10 ──────────────────────
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<ProductResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] int skip  = 0,
        [FromQuery] int limit = 10)
    {
        var products = await productService.GetAllAsync(skip, limit);
        return Ok(products);
    }

    // ── GET /api/v1/products/{id} ─────────────────────────────────
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ProductResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById([FromRoute] int id)
    {
        var product = await productService.GetByIdAsync(id);
        return product is null ? NotFound(new { detail = $"Product with id={id} not found" }) : Ok(product);
    }

    // ── POST /api/v1/products ─────────────────────────────────────
    [HttpPost]
    [ProducesResponseType(typeof(ProductResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] ProductCreateDto dto)
    {
        // [ApiController] automatically validates the DTO and returns 400 if invalid,
        // so we don't need to check ModelState manually.
        var created = await productService.CreateAsync(dto);

        // CreatedAtAction returns 201 + Location: /api/v1/products/{id}
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    // ── PUT /api/v1/products/{id} ─────────────────────────────────
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ProductResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update([FromRoute] int id, [FromBody] ProductUpdateDto dto)
    {
        var updated = await productService.UpdateAsync(id, dto);
        return updated is null ? NotFound(new { detail = $"Product with id={id} not found" }) : Ok(updated);
    }

    // ── DELETE /api/v1/products/{id} ──────────────────────────────
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete([FromRoute] int id)
    {
        var deleted = await productService.DeleteAsync(id);
        return deleted ? NoContent() : NotFound(new { detail = $"Product with id={id} not found" });
    }
}
