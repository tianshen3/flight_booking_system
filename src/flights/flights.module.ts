import { Module } from '@nestjs/common';
import { FlightRepository } from './repositories/flight.repository';
import { SeatRepository } from './repositories/seats.repository';
import { FlightsService } from './service/flights.service';
import { FlightsController } from './controller/flights.controller';
import { SeatsService } from './service/seats.service';
import { FlightSeatsController } from './controller/flight.seats.controller';
import { SeatsController } from './controller/seats.controller';


@Module({
    controllers: [
        FlightSeatsController,
        FlightsController,
        SeatsController,
    ],
    providers: [
        FlightsService,
        SeatsService,
        FlightRepository,
        SeatRepository,
    ],
    exports: [
        FlightRepository,
        SeatRepository,
    ],
})

export class FlightsModule {}