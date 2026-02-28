/**
 * UpdateUserDto — Data Transfer Object for partial user updates (PUT /users/:id).
 *
 * Why is every field @IsOptional() here?
 * For update operations (PUT/PATCH), the client may want to change only a
 * subset of fields. Making everything optional allows sending just
 * { "name": "New Name" } without having to resend the full user object.
 *
 * This is essentially a manual "PartialType" — the same effect you would get
 * from PartialType(CreateUserDto) via @nestjs/mapped-types, but written
 * explicitly for clarity and to avoid an extra dependency.
 *
 * The validation decorators still apply when a field IS provided:
 * - If you send { "email": "not-an-email" }, it will still fail validation.
 * - If you omit "email" entirely, validation is skipped for that field.
 */

import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsIn,
  MaxLength,
} from 'class-validator';

export class UpdateUserDto {
  /**
   * Optional name update — still enforces string type and max length
   * if the value is provided.
   */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  /**
   * Optional email update — still validates email format if provided.
   */
  @IsOptional()
  @IsEmail()
  email?: string;

  /**
   * Optional role update — still restricts to allowed enum values if provided.
   */
  @IsOptional()
  @IsIn(['admin', 'user', 'moderator'])
  role?: string;

  /**
   * Optional isActive toggle — useful for activating/deactivating an account.
   */
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
