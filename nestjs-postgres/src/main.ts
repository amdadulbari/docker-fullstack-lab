/**
 * main.ts — Application Entry Point
 *
 * This is the first file executed when the application starts.
 * It bootstraps the NestJS application using NestFactory, applies
 * global middleware/pipes, and starts the HTTP server.
 *
 * NestJS uses the Express (or Fastify) HTTP adapter under the hood.
 * The default is Express (@nestjs/platform-express).
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  /**
   * NestFactory.create(AppModule) — initializes the NestJS IoC container,
   * resolves all module dependencies, establishes the DB connection,
   * and creates the underlying HTTP server instance.
   */
  const app = await NestFactory.create(AppModule);

  /**
   * Global ValidationPipe
   *
   * Applying ValidationPipe globally here means EVERY request body, param,
   * and query across ALL controllers is validated automatically.
   *
   * Options:
   * - whitelist: true          → strips any properties not defined in the DTO
   *                              (protects against mass-assignment attacks)
   * - forbidNonWhitelisted: false → don't throw an error for extra properties,
   *                                 just silently strip them (whitelist handles it)
   * - transform: true          → auto-converts primitive types:
   *                              e.g., route param "42" (string) → 42 (number)
   *                              e.g., "true" (string) → true (boolean)
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  /**
   * Read the PORT from environment variables.
   * Falls back to 3000 if PORT is not set.
   * In Docker, this is set via the env_file in docker-compose.yml.
   */
  const port = process.env.PORT || 3000;

  await app.listen(port);
  console.log(`Application running on port ${port}`);
}

bootstrap();
