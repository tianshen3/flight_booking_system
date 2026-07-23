import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/infrastructure/redis/redis.service';

@Injectable()
export class SeatLockService{
    constructor(
        private readonly redisService: RedisService,
    ){}

    //helper method for key generation 
    private generateSeatKey(
        flightId: number,
        seatId: number,
    ): string {
        return `seat:${flightId}:${seatId}`;
    }

    //create the lock seat method
    async lockSeat(
        flightId: number,
        seatId: number,
        userId: number,
    ): Promise<boolean> {

        //generating key using helper method
        const key = this.generateSeatKey(flightId, seatId);

        const value = {
            userId,
            LockedAt: new Date().toISOString(),
        };

        const serializedValue = JSON.stringify(value);

        //getting redis client which is ioredis instance
        const client = this.redisService.getClient();

        //getting response from redis
        const result = await client.set(
            key,
            serializedValue,
            'EX',
            300,
            'NX',
        );

        return result==='OK';
    }

    //verify lock
    async hasLock(
        flightId: number,
        seatId: number,
    ): Promise<boolean> {
        const key = this.generateSeatKey(flightId, seatId);

        const client = this.redisService.getClient();

        const result = await client.exists(key);

        return result === 1;
    }

    //relase lock
    async releaseLock(
        flightId: number,
        seatId: number,
    ): Promise<void> {
        const key = this.generateSeatKey(flightId, seatId);

        const client = this.redisService.getClient();

        await client.del(key);
    }
}