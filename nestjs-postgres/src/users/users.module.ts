/**
 * UsersModule — Feature Module for Users
 *
 * In NestJS, a Module is the fundamental organizational unit. Every feature
 * should have its own module that groups its related controllers, services,
 * and dependencies together.
 *
 * Think of modules as self-contained "packages" within your application.
 * AppModule is the root that imports all feature modules.
 *
 * @Module decorator fields:
 * - imports:     Other modules whose exports are needed here
 * - controllers: HTTP request handlers belonging to this module
 * - providers:   Services, repositories, and other injectable classes
 * - exports:     What this module makes available to other modules (if needed)
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  /**
   * TypeOrmModule.forFeature([User]) — registers the User entity's Repository
   * within this module's scope. This is what enables @InjectRepository(User)
   * in UsersService. Without this, the DI container wouldn't know how to
   * resolve the Repository<User> dependency.
   */
  imports: [TypeOrmModule.forFeature([User])],

  /**
   * UsersController handles all incoming HTTP requests for the /users route.
   */
  controllers: [UsersController],

  /**
   * UsersService contains the business logic and is injected into the controller.
   * Listing it here makes it available for injection within this module.
   */
  providers: [UsersService],
})
export class UsersModule {}
