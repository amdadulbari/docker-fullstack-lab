/**
 * UsersController — HTTP Request Handling Layer
 *
 * Controllers are responsible for:
 * - Receiving incoming HTTP requests
 * - Extracting data from the request (params, body, query)
 * - Calling the appropriate Service method
 * - Returning the HTTP response
 *
 * Controllers do NOT contain business logic — that belongs in the Service.
 *
 * @Controller('users') — sets the route prefix for all methods in this class.
 * All routes here will be prefixed with /users.
 *
 * Route mapping summary:
 *   GET    /users       → findAll()
 *   POST   /users       → create()
 *   GET    /users/:id   → findOne()
 *   PUT    /users/:id   → update()
 *   DELETE /users/:id   → remove()
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

/**
 * @UsePipes(ValidationPipe) — applies the ValidationPipe to every route
 * in this controller. It triggers class-validator decorators on DTOs.
 *
 * Options used:
 * - whitelist: true       → strips any extra properties not in the DTO
 * - transform: true       → auto-converts route params (string → number via ParseIntPipe)
 */
@Controller('users')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class UsersController {
  /**
   * NestJS injects UsersService automatically via constructor injection.
   * The "private readonly" pattern is idiomatic NestJS — it declares and
   * assigns the property in one step.
   */
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /users
   *
   * Returns all users ordered by createdAt DESC.
   * Default HTTP status is 200 OK.
   */
  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  /**
   * POST /users
   *
   * @HttpCode(HttpStatus.CREATED) — overrides the default 200 status to
   * return 201 Created, which is the correct REST response for resource creation.
   *
   * @Body() dto — extracts the entire request body and maps it to CreateUserDto.
   * The ValidationPipe then runs all class-validator decorators on dto.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  /**
   * GET /users/:id
   *
   * @Param('id', ParseIntPipe) — extracts the :id route parameter and
   * automatically converts it from string to integer. If the value is not
   * a valid integer, ParseIntPipe throws a 400 Bad Request before the
   * controller method is even called.
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.findOne(id);
  }

  /**
   * PUT /users/:id
   *
   * Accepts a partial body (UpdateUserDto) and merges changes into the existing user.
   * Returns the updated user entity with a 200 OK.
   */
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  /**
   * DELETE /users/:id
   *
   * @HttpCode(HttpStatus.NO_CONTENT) — returns 204 No Content on success.
   * 204 is the correct REST status for a successful DELETE with no response body.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.usersService.remove(id);
  }
}
