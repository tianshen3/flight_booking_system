import { Module } from '@nestjs/common';
import { FlightRepository } from './repositories/flight.repository';
import { SeatRepository } from './repositories/seats.repository';
import { FlightsService } from './service/flights.service';
import { FlightsController } from './controller/flights.controller';

@Module({
    controllers: [FlightsController],
    providers: [
        FlightsService,
        FlightRepository,
        SeatRepository,
    ],
    exports: [
        FlightRepository,
        SeatRepository,
    ],
})

export class FlightsModule {}