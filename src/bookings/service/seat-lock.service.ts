import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/infrastructure/redis/redis.service';

@Injectable()
export class SeatLockService{
    constructor(
        private readonly redisService: RedisService,
    ){}
}