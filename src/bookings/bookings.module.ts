import { Module } from '@nestjs/common';
import { BookingRepository } from './repositories/booking.repository';
import { BookingService } from './service/bookings.service';
import { UsersModule } from 'src/users/users.module';
import { FlightsModule } from 'src/flights/flights.module';

@Module({
    imports: [
        UsersModule,
        FlightsModule,
    ],
    providers: [
        BookingRepository,
        BookingService
    ],
    exports: [BookingRepository],
})

export class BookingModule{}