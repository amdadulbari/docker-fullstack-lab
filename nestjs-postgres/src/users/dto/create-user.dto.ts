/**
 * CreateUserDto — Data Transfer Object for creating a user.
 *
 * What is a DTO?
 * A DTO (Data Transfer Object) is a plain class used to define the shape of
 * data flowing INTO your API (request bodies). It acts as a contract between
 * the client and server, and is where we place validation rules.
 *
 * Why use DTOs instead of raw request bodies?
 * - Type safety at compile time (TypeScript)
 * - Runtime validation via class-validator decorators
 * - Auto-transformation via class-transformer (e.g., string → number)
 * - Clear documentation of what fields are expected
 *
 * class-validator decorators work at RUNTIME (not compile time) and are
 * activated by NestJS's ValidationPipe (configured in main.ts).
 */

import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsIn,
  MaxLength,
} from 'class-validator';

export class CreateUserDto {
  /**
   * @IsString()    — value must be a string type
   * @IsNotEmpty()  — value must not be an empty string ('')
   * @MaxLength(100)— value must be at most 100 characters
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  /**
   * @IsEmail() — validates that the string is a valid email format.
   * Internally uses a regex to check for proper email structure.
   */
  @IsEmail()
  email: string;

  /**
   * @IsOptional() — if this field is absent from the request body,
   * the remaining validators on this field are skipped entirely.
   *
   * @IsIn([...]) — value must be one of the provided allowed values.
   * This is a whitelist check, rejecting anything outside the array.
   */
  @IsOptional()
  @IsIn(['admin', 'user', 'moderator'])
  role?: string;

  /**
   * @IsBoolean() — validates the value is strictly true or false.
   * Note: with transform:true in ValidationPipe, the string "true"
   * will be auto-converted to boolean true before validation.
   */
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
