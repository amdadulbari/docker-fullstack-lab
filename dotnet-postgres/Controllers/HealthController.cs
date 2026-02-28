/*
 * Controllers/HealthController.cs
 * ────────────────────────────────
 * GET /health
 *
 * Returns the health status of the app and the database connection.
 * Used by Docker healthcheck, Kubernetes liveness probes, and load balancers.
 *
 * ASP.NET Core controller concepts:
 *
 *   [ApiController]       → enables automatic model validation + problem details responses
 *   [Route("[controller]")]  → sets route prefix from class name (minus "Controller")
 *   ControllerBase        → base class for API controllers (no View support needed)
 *   IActionResult         → return type that can represent any HTTP response
 */

using DotnetPostgres.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DotnetPostgres.Controllers;

[ApiController]
[Route("[controller]")]   // resolves to GET /health
public class HealthController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetHealth()
    {
        try
        {
            // Execute a lightweight query to verify the database connection is alive.
            // FormattableString overload is SQL-injection safe (parameterised query).
            await db.Database.ExecuteSqlRawAsync("SELECT 1");

            return Ok(new
            {
                status    = "ok",
                database  = "ok",
                timestamp = DateTime.UtcNow,
            });
        }
        catch (Exception ex)
        {
            // Return 503 so load balancers know this instance is unhealthy
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new
            {
                status    = "error",
                database  = "unreachable",
                detail    = ex.Message,
            });
        }
    }
}
