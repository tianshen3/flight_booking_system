import { Module } from '@nestjs/common';
import { FlightRepository } from './repositories/flight.repository';
import { SeatRepository } from './repositories/seats.repository';

@Module({
    providers: [
        FlightRepository,
        SeatRepository,
    ],
    exports: [
        FlightRepository,
        SeatRepository,
    ],
})

export class FlightsModule {}