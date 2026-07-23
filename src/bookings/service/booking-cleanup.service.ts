import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SeatRepository } from 'src/flights/repositories/seats.repository';
import { BookingRepository } from '../repositories/booking.repository';
import { BookingStatus, SeatStatus } from '@prisma/client';

@Injectable()
export class BookingCleanupService {
    constructor(
        private readonly bookingRepository: BookingRepository,
        private readonly seatRepository: SeatRepository,
    ){}

    @Cron(CronExpression.EVERY_MINUTE)
    async cleanupExpiredBookings() {
        
        const expiryTime = new Date(Date.now() - 5*60*1000);

        const expiredBookings = await this.bookingRepository.findExpiredLockedBookings(expiryTime);

        for(const booking of expiredBookings){

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
        }
    }
}