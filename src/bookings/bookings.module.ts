import { Module } from '@nestjs/common';
import { BookingRepository } from './repositories/booking.repository';

@Module({
    providers: [BookingRepository],
    exports: [BookingRepository],
})

export class BookingModule{}