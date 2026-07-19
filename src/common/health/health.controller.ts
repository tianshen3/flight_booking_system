import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { RedisService } from '../../infrastructure/redis/redis.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  async check() {
    const [database, redis] = await Promise.all([
      this.prismaService.isHealthy(),
      this.redisService.isHealthy(),
    ]);

    return {
      status: database && redis ? 'ok' : 'degraded',
      services: {
        database: database ? 'up' : 'down',
        redis: redis ? 'up' : 'down',
      },
    };
  }
}
