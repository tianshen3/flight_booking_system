import { Module } from '@nestjs/common';
import { BookingRepository } from './repositories/booking.repository';
import { BookingService } from './service/bookings.service';
import { UsersModule } from 'src/users/users.module';
import { FlightsModule } from 'src/flights/flights.module';
import { SeatLockService } from './service/seat-lock.service';
import { BookingCleanupService } from './service/booking-cleanup.service';
import { BookingController } from './controller/bookings.controller';

@Module({
    controllers: [
        BookingController,
    ],
    imports: [
        UsersModule,
        FlightsModule,
    ],
    providers: [
        BookingRepository,
        BookingService,
        SeatLockService,
        BookingCleanupService,
    ],
    exports: [BookingRepository],
})

export class BookingModule{}