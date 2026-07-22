import {
    Controller,
} from '@nestjs/common';

import { SeatsService } from '../service/seats.service';
import { SeatResponseDto } from '../dto/seat-response.dto';

@Controller('flights/:flightsId/seats')
export class FlightSeatsController {
    
    constructor(private readonly seatsService: SeatsService){}
    
    //get all seats for a flight
    async getSeatsByFlightId(
        flightId: number,
    ): Promise<SeatResponseDto[]> {
        return this.seatsService.getSeatsByFlightId(flightId);
    }

}