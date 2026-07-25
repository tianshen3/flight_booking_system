import {
    Controller,
    Get,
    Param,
    ParseIntPipe,
} from '@nestjs/common';

import { SeatsService } from '../service/seats.service';
import { SeatResponseDto } from '../dto/seat-response.dto';

@Controller('flights/:flightId/seats')
export class FlightSeatsController {
    
    constructor(private readonly seatsService: SeatsService){}
    
    //get all seats for a flight
    @Get()
    async getSeatsByFlightId(
        @Param('flightId', ParseIntPipe) flightId: number,
    ): Promise<SeatResponseDto[]> {
        return this.seatsService.getSeatsByFlightId(flightId);
    }

}