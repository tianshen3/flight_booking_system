import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SeatRepository } from 'src/flights/repositories/seats.repository';
import { BookingRepository } from '../repositories/booking.repository';
import { BookingStatus, SeatStatus } from '@prisma/client';
import { SeatReassignmentService } from 'src/waitlist/service/seat-reassignment.service';

@Injectable()
export class BookingCleanupService {
    constructor(
        private readonly bookingRepository: BookingRepository,
        private readonly seatRepository: SeatRepository,
        private readonly seatReassignment: SeatReassignmentService,
    ){}

    @Cron(CronExpression.EVERY_MINUTE)
    async cleanupExpiredBookings() {
        
        const expiryTime = new Date(Date.now() - 5*60*1000);

        const expiredBookings = await this.bookingRepository.findExpiredLockedBookings(expiryTime);

        console.log(
             `Found ${expiredBookings.length} expired bookings to clean up.`,   
        );

        for(const booking of expiredBookings){
              try {
                //status update of booking to expired
                await this.bookingRepository.updateStatus(
                    booking.id,
                    BookingStatus.EXPIRED,
                )
    
                //status update of the seat to available
                await this.seatRepository.updateSeatStatus(
                    booking.seatId,
                    SeatStatus.AVAILABLE,
                );

                //try to assign this seat to the highest clvScore customer
                await this.seatReassignment.assignSeat(
                    booking.flightId,
                    booking.seatId,
                )
            } catch (error) {
                console.error(
                    `Failed to cleanup booking ${booking.id}: `,
                    error,
                );
            }
        }


        console.log('Booking cleanup completed.');
    }
}