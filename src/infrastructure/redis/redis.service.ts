import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;

  constructor(private readonly configService: ConfigService) {
  this.client = new Redis({
    host: this.configService.get<string>('REDIS_HOST'),
    port: this.configService.get<number>('REDIS_PORT'),
    username: this.configService.get<string>('REDIS_USERNAME', 'default'),
    password: this.configService.get<string>('REDIS_PASSWORD'),
    tls: {},
    lazyConnect: true,
    maxRetriesPerRequest: 1,
  });
}

  getClient(): Redis {
    return this.client;
  }

  async isHealthy(): Promise<boolean> {
    try {
      if (this.client.status === 'wait') {
        await this.client.connect();
      }

      const response = await this.client.ping();
      return response === 'PONG';
    } catch {
      return false;
    }
  }

  async onModuleDestroy() {
    this.client.disconnect();
  }
}
