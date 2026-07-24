import { Injectable } from '@nestjs/common';
import { WaitlistRepository } from '../repository/waitlist.repository';
import { RedisService } from 'src/infrastructure/redis/redis.service';

@Injectable()
export class WaitlistRedisService {
    constructor (
        private readonly waitlistRepository: WaitlistRepository,
        private readonly redisSerivce: RedisService,
    ){}

    private get client() {
        return this.redisSerivce.getClient();
    }

    private getWailtistKey(flightId: number): string {
        return `waitlist: ${flightId}`;
    }

    //method to add user in a particular key
    async addUser(
        flightId: number,
        userId: number,
        clvScore: number,
    ){

        const key = this.getWailtistKey(flightId);

        await this.client.zadd(
            key,
            clvScore,
            userId.toString(),
        );
    }

    //method to remove the user from the waitlist
    async removeUser(
        flightId: number,
        userId: number,
    ) {
        const key = this.getWailtistKey(flightId);

        await this.client.zrem(
            key,
            userId.toString(),
        );
    }

    //method to get the highest priority user
    async getHighestPriorityUser(
        flightId: number,
    ) {
        const key = this.getWailtistKey(flightId);

        const users = await this.client.zrevrange(
            key,
            0,
            0,
        );

        return users.length ? Number(users[0]) : null;
    }

    //method to check wheter the user exists in the waitlist or not
    async exists(
        flightId: number,
        userId: number,
    ) {
        const key = this.getWailtistKey(flightId);

        const score = await this.client.zscore(
            key,
            userId.toString(),
        );

        return score !== null;
    }

    //method to the count of users in the waitlist
    async getCount(flightId: number) {
        const key = this.getWailtistKey(flightId);

        return this.client.zcard(key);
    }
}