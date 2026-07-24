import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { WaitlistRepository } from '../repository/waitlist.repository';
import { FlightRepository } from 'src/flights/repositories/flight.repository';
import { UserRepository } from 'src/users/repositories/user.repository';
import { WaitlistRedisService } from './waitlist-redis.service';
import { BookingRepository } from 'src/bookings/repositories/booking.repository';
import { JoinWaitlistDto } from '../dto/join-waitlist.dto';

@Injectable()
export class WaitlistService{
    constructor(
        private readonly waitlistRepository: WaitlistRepository,
        private readonly waitlistRedisService: WaitlistRedisService,
        private readonly userRepository: UserRepository,
        private readonly flightRepository: FlightRepository,
        private readonly bookingRepository: BookingRepository,
    ){}

    //method to join the waitlist
    async joinWaitlist(dto: JoinWaitlistDto){

        //validate the user
        const user = await this.userRepository.findById(dto.userId);
        if(!user){
            throw new NotFoundException('User not found');
        }

        //validate the fligth
        const flight = await this.flightRepository.findById(dto.flightId);
        if(!flight){
            throw new NotFoundException('Flight not found');
        }

        //checking if already in the queue
        const alreadyQueued = await this.waitlistRepository.exists(
            dto.userId,
            dto.flightId,
        );
        if(alreadyQueued){
            throw new ConflictException('User already in waitlist');
        }

        
        //check the booking status of the user
        const confirmedBooking = await this.bookingRepository.findConfirmedBooking(
            dto.userId,
            dto.flightId,
        );
        if(confirmedBooking){
            throw new ConflictException('User already has a confirmed booking for this flight');
        }


        //fetch the clvScore of the user
        const clvScore = user.clvScore;

        //create the waitlist entry in the postgres
        const waitlistEntry = await this.waitlistRepository.create({
            user: {
                connect: {
                    id: dto.userId,
                },
            },
            flight: {
                connect: {
                    id: dto.flightId,
                },
            },
            clvScore,
        });

        //now create the entry in the redis
        await this.waitlistRedisService.addUser(
            dto.flightId,
            dto.userId,
            clvScore,
        );

        //zero based 
        const position = await this.waitlistRedisService.getCount(
            dto.flightId,
        );

        return {
            id: waitlistEntry.id,
            userId: dto.userId,
            flightId: dto.flightId,
            clvScore,
            position,
        };
    }
}