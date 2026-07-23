import { Module } from '@nestjs/common';
import { BookingRepository } from './repositories/booking.repository';
import { BookingService } from './service/bookings.service';
import { UsersModule } from 'src/users/users.module';
import { FlightsModule } from 'src/flights/flights.module';
import { SeatLockService } from './service/seat-lock.service';

@Module({
    imports: [
        UsersModule,
        FlightsModule,
    ],
    providers: [
        BookingRepository,
        BookingService,
        SeatLockService,
    ],
    exports: [BookingRepository],
})

export class BookingModule{}