import { Module } from '@nestjs/common';
import { FlightRepository } from './repositories/flight.repository';

@Module({
    providers: [FlightRepository],
    exports: [FlightRepository],
})

export class FlightsModule {}