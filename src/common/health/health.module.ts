import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { RedisModule } from '../../infrastructure/redis/redis.module';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
  imports: [DatabaseModule, RedisModule],
})
export class HealthModule {}
