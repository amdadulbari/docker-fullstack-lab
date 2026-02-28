/**
 * HealthModule — Infrastructure Health Feature Module
 *
 * This module groups the health check functionality.
 * It does not need TypeOrmModule.forFeature() since it doesn't use
 * any entity repositories — it only needs the raw DataSource connection,
 * which is globally provided by TypeOrmModule.forRootAsync() in AppModule.
 *
 * NestJS makes DataSource available for injection anywhere in the app
 * as long as TypeOrmModule is initialized at the root level.
 */

import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

@Module({
  /**
   * No imports needed here for DataSource — TypeOrmModule.forRootAsync()
   * in AppModule registers DataSource as a global provider automatically,
   * making it injectable in any module without explicit re-importing.
   */
  controllers: [HealthController],
})
export class HealthModule {}
