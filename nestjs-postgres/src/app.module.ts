/**
 * AppModule — Root Application Module
 *
 * This is the top-level module that NestJS bootstraps first.
 * It acts as the composition root — wiring together all feature modules
 * and global infrastructure (database, config, etc.).
 *
 * NestJS builds a Directed Acyclic Graph (DAG) of all modules and their
 * dependencies, then instantiates them in the correct order using the
 * Dependency Injection container.
 *
 * Module loading order here:
 * 1. ConfigModule  — loads environment variables first (used by TypeORM)
 * 2. TypeOrmModule — establishes DB connection using config values
 * 3. UsersModule   — registers the Users feature (routes, service, entity)
 * 4. HealthModule  — registers the health check route
 */

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    /**
     * ConfigModule.forRoot({ isGlobal: true })
     *
     * - Reads the .env file and loads all variables into process.env
     * - isGlobal: true — makes ConfigService injectable in ANY module
     *   without needing to re-import ConfigModule everywhere
     *
     * Environment variables are accessed via:
     *   configService.get<string>('DB_HOST')
     */
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    /**
     * TypeOrmModule.forRootAsync()
     *
     * The "Async" variant is required when the configuration depends on
     * another provider (ConfigService here). It tells NestJS to wait for
     * ConfigModule to initialize before calling the useFactory function.
     *
     * forRoot() vs forRootAsync():
     * - forRoot()      → static config, values known at compile time
     * - forRootAsync() → dynamic config, values resolved from DI container
     *
     * IMPORTANT: synchronize: true auto-creates/alters tables based on
     * entity definitions. This is convenient for development but DANGEROUS
     * in production — use TypeORM migrations instead for production deployments.
     */
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',

        // Connection details read from environment variables
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: +configService.get<string>('DB_PORT', '5432'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),

        // List all entities that TypeORM should manage.
        // TypeORM uses this to know which tables to create/sync.
        entities: [User],

        // synchronize: true — auto-creates/updates tables from entity definitions.
        // WARNING: never use synchronize:true in production — use migrations.
        synchronize: true,

        // Enable SQL query logging when DEBUG=true in the environment.
        // Useful for debugging slow queries or unexpected SQL.
        logging: configService.get<string>('DEBUG', 'false') === 'true',
      }),
      inject: [ConfigService],
    }),

    /**
     * Feature modules — each encapsulates its own routes, services, and DB logic.
     */
    UsersModule,
    HealthModule,
  ],
})
export class AppModule {}
