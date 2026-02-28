/**
 * UsersService — Business Logic Layer
 *
 * In NestJS's layered architecture:
 *   Controller → Service → Repository → Database
 *
 * The Service layer is responsible for:
 * - All business logic (e.g., "can this user be deleted?")
 * - Database operations via TypeORM's Repository
 * - Throwing appropriate HTTP exceptions for error cases
 *
 * @Injectable() marks this class as a provider that can be injected
 * into other classes (like controllers) via NestJS's Dependency Injection
 * container. You never call `new UsersService()` manually — NestJS handles it.
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  /**
   * Constructor injection with @InjectRepository(User).
   *
   * TypeORM provides a generic Repository<T> for each entity, offering
   * methods like find(), findOneBy(), save(), remove(), etc.
   *
   * @InjectRepository(User) tells NestJS's DI container which specific
   * repository to inject here — it must also be registered in the module
   * via TypeOrmModule.forFeature([User]).
   */
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  /**
   * findAll — retrieve all users, newest first.
   *
   * The `order` option generates: ORDER BY "createdAt" DESC
   * Returns an empty array [] if no users exist (not an error).
   */
  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * findOne — retrieve a single user by primary key.
   *
   * findOneBy() is a shorthand for findOne({ where: { id } }).
   * We throw NotFoundException (maps to HTTP 404) if the user doesn't exist.
   * This exception propagates up through the controller to the client.
   */
  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  /**
   * create — persist a new user to the database.
   *
   * this.usersRepository.create() builds a User entity instance from the DTO
   * (it does NOT save to the DB yet). .save() then executes the INSERT query
   * and returns the saved entity with auto-generated fields (id, createdAt, etc.).
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  /**
   * update — partially update an existing user.
   *
   * Strategy:
   * 1. findOne() — ensures user exists (throws 404 if not)
   * 2. Object.assign() — merges only the provided DTO fields onto the entity
   * 3. save() — executes UPDATE SQL for the changed fields
   *
   * Using Object.assign() with the full entity (loaded from DB) ensures
   * unchanged fields retain their current values.
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  /**
   * remove — delete a user from the database.
   *
   * We call findOne() first so that attempting to delete a non-existent
   * user returns a proper 404 instead of silently succeeding.
   * repository.remove() executes DELETE FROM users WHERE id = $1.
   */
  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }
}
