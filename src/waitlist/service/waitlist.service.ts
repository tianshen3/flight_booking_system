import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { WaitlistRepository } from '../repository/waitlist.repository';
import { FlightRepository } from 'src/flights/repositories/flight.repository';
import { UserRepository } from 'src/users/repositories/user.repository';
import { WaitlistRedisService } from './waitlist-redis.service';
import { BookingRepository } from 'src/bookings/repositories/booking.repository';
import { JoinWaitlistDto } from '../dto/join-waitlist.dto';
import { WaitlistResponseDto } from '../dto/waitlist-response.dto';

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
    async joinWaitlist(
        dto: JoinWaitlistDto,
        userId: number,
    ): Promise<WaitlistResponseDto> {

        //validate the user
        const user = await this.userRepository.findById(userId);
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
            userId,
            dto.flightId,
        );
        if(alreadyQueued){
            throw new ConflictException('User already in waitlist');
        }

        
        //check the booking status of the user
        const confirmedBooking = await this.bookingRepository.findConfirmedBooking(
            userId,
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
                    id: userId,
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
            userId,
            clvScore,
        );

        //zero based 
        const position = await this.waitlistRedisService.getCount(
            dto.flightId,
        );

        return {
            id: waitlistEntry.id,
            userId: userId,
            flightId: dto.flightId,
            clvScore,
            position,
        };
    }

    //method to leave the waitlist
    async leaveWaitlist(
        id: number,
        userId: number,
    ) {

        //finding waitlist entry in the 
        const waitlistEntry = await this.waitlistRepository.findById(id);
        if(!waitlistEntry){
            throw new NotFoundException('Waitlist entry not found');
        }

        //checking wheter the fetched waitlist belongs to the user or not
        if(waitlistEntry.userId !== userId){
            throw new ForbiddenException(
                'You cannot remove another user from the waitlist'
            );
        }
        
        //remove this from the postgres
        await this.waitlistRepository.remove(id);

        //remove the entry from the redis as well
        await this.waitlistRedisService.removeUser(
            waitlistEntry.flightId,
            waitlistEntry.userId,
        );

        return {
            message: 'User removed from the waitlist successfully.',
        }
    }

    //method to get the entire  waitlist of the flight
    async getFlightWaitlist(flightId: number): Promise<WaitlistResponseDto[]> {

        const flight = await this.flightRepository.findById(flightId);
        if(!flight){
            throw new NotFoundException('Flight not found');
        }

        //get the list from the db
        const waitlist = await this.waitlistRepository.findByFlight(flightId);

        return waitlist.map((entry, index) => ({
            id: entry.id,
            userId: entry.userId,
            flightId: entry.flightId,
            clvScore: entry.clvScore,
            position: index+1,
        }))
    }
}