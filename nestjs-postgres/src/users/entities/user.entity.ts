/**
 * User Entity
 *
 * In TypeORM, an "entity" is a class that maps to a database table.
 * Each instance of this class represents a single row in that table.
 *
 * The decorators below instruct TypeORM on how to create the schema:
 * - @Entity()         → marks this class as a DB table
 * - @Column()         → marks a property as a DB column
 * - @PrimaryGeneratedColumn() → auto-increment primary key
 * - @CreateDateColumn()       → auto-set on INSERT
 * - @UpdateDateColumn()       → auto-set on UPDATE
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * @Entity('users') — tells TypeORM to map this class to the "users" table.
 * If no name is provided, TypeORM defaults to the lowercased class name.
 */
@Entity('users')
export class User {
  /**
   * @PrimaryGeneratedColumn() — auto-increment integer primary key.
   * TypeORM will create a SERIAL (or BIGSERIAL) column in PostgreSQL.
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * @Column({ length: 100, nullable: false }) — maps to VARCHAR(100) NOT NULL.
   * "length" sets the maximum character length for the column.
   */
  @Column({ length: 100, nullable: false })
  name: string;

  /**
   * @Column({ unique: true }) — adds a UNIQUE constraint on the email column.
   * This prevents two users from sharing the same email address.
   */
  @Column({ length: 200, nullable: false, unique: true })
  email: string;

  /**
   * @Column with an enum restricts allowed values at the DB level.
   * The "default" option sets the column's DEFAULT value in PostgreSQL.
   */
  @Column({
    length: 50,
    default: 'user',
    enum: ['admin', 'user', 'moderator'],
  })
  role: string;

  /**
   * @Column({ default: true }) — boolean column, defaults to TRUE.
   * Useful for soft-deactivating accounts without deleting them.
   */
  @Column({ default: true })
  isActive: boolean;

  /**
   * @CreateDateColumn() — TypeORM automatically sets this to the current
   * timestamp when a new record is INSERTed. You never set it manually.
   */
  @CreateDateColumn()
  createdAt: Date;

  /**
   * @UpdateDateColumn() — TypeORM automatically updates this timestamp
   * every time the record is saved/updated via the repository.
   */
  @UpdateDateColumn()
  updatedAt: Date;
}
