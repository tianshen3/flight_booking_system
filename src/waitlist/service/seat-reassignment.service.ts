import { ConflictException, Injectable } from '@nestjs/common';
import { WaitlistRepository } from '../repository/waitlist.repository';
import { WaitlistRedisService } from './waitlist-redis.service';
import { BookingRepository } from 'src/bookings/repositories/booking.repository';
import { SeatRepository } from 'src/flights/repositories/seats.repository';
import { UserRepository } from 'src/users/repositories/user.repository';
import { BookingStatus, SeatStatus } from '@prisma/client';
import { filter } from 'rxjs';

@Injectable()
export class SeatReassignmentService{
    constructor (
        private readonly waitlistRepository: WaitlistRepository,
        private readonly waitlistRedisService: WaitlistRedisService,
        private readonly bookingRepository: BookingRepository,
        private readonly seatRepository: SeatRepository,
        private readonly userRepository: UserRepository,
    ){}

    //method to assign seat
    async assignSeat(
        flightId: number,
        seatId: number,
    ) {
        
        //from the waitlist(redis sorted set) get the user with highest clvScore 
        const userId = await this.waitlistRedisService.getHighestPriorityUser(flightId);
        if(!userId){
            return null;
        }

        //checking wheter the user is in waitlist or not
        const waitlistEntry = await this.waitlistRepository.exists(
            userId,
            flightId,
        );
        if(!waitlistEntry){
            await this.waitlistRedisService.removeUser(
                flightId,
                userId,
            );

            return null;
        }

        //finding this user from the user table
        const user = await this.userRepository.findById(userId);
        if(!user){
             await this.waitlistRedisService.removeUser(
                flightId,
                userId,
            );

            if(waitlistEntry){
                await this.waitlistRepository.remove(waitlistEntry.id);
            }
            return null;
        }

        //now checking whether the user has a confirmed booking in this flight throught another path
        const existingBooking = await this.bookingRepository.findConfirmedBooking(
            userId,
            flightId,
        );
        
        if(existingBooking){
            //if the confirmed booking exists and the user is in the waitlist , then clean up the stale waitlist
            if(waitlistEntry){
                await this.waitlistRepository.remove(waitlistEntry.id);
            }

            await this.waitlistRedisService.removeUser(
                flightId,
                userId,
            );

            return null;
        }

        //this seat will be assigned to this user
        const booking = await this.bookingRepository.create({
            userId,
            flightId,
            seatId,
            status: BookingStatus.CONFIRMED,
        });

        //updating the seatstatus
        await this.seatRepository.updateSeatStatus(
            seatId,
            SeatStatus.BOOKED 
        );

        //remove the user from the waitlist of postgres and redis
        await this.waitlistRepository.remove(waitlistEntry.id);
        await this.waitlistRedisService.removeUser(
            flightId,
            userId,
        );

        return booking;
    }
}