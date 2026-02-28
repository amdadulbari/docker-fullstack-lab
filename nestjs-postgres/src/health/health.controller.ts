/**
 * HealthController — Infrastructure Health Check
 *
 * A health endpoint is a lightweight route used by:
 * - Docker (healthcheck directive)
 * - Kubernetes (liveness/readiness probes)
 * - Load balancers (to know when to route traffic)
 * - Monitoring tools (Datadog, Prometheus, etc.)
 *
 * This endpoint checks both application and database connectivity,
 * returning a structured response with the current status.
 */

import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  /**
   * DataSource is TypeORM's main connection object. It provides low-level
   * access to run raw SQL queries, manage transactions, and inspect
   * the connection state.
   *
   * NestJS's DI container injects it automatically because TypeOrmModule
   * registers it as a provider in the global scope.
   */
  constructor(private readonly dataSource: DataSource) {}

  /**
   * GET /health
   *
   * Performs a lightweight database ping using `SELECT 1`.
   * This query is the standard minimal query to verify DB connectivity —
   * it returns immediately with no table scans or I/O.
   *
   * Response on success (200 OK):
   * {
   *   "status": "ok",
   *   "database": "ok",
   *   "timestamp": "2024-01-01T00:00:00.000Z"
   * }
   *
   * Response on failure (500 Internal Server Error):
   * {
   *   "statusCode": 500,
   *   "message": "Database connection failed: <error details>"
   * }
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async check(): Promise<{ status: string; database: string; timestamp: string }> {
    try {
      // SELECT 1 is the canonical "ping" query — minimal overhead,
      // just verifies the connection is alive and the DB is responding.
      await this.dataSource.query('SELECT 1');

      return {
        status: 'ok',
        database: 'ok',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      // If the DB query fails, we throw a 503 Service Unavailable.
      // This signals to load balancers/orchestrators that this instance
      // should not receive traffic until the DB connection is restored.
      throw new HttpException(
        {
          status: 'error',
          database: 'unavailable',
          message: `Database connection failed: ${error.message}`,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
