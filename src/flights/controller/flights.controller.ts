import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
} from '@nestjs/common';
import { FlightsService } from '../service/flights.service';
import { CreateFlightDto } from '../dto/create-flight.dto';
import { FlightResponseDto } from '../dto/flight-response.dto';

@Controller('flights')
export class FlightsController {
    constructor(private readonly flightsService: FlightsService){}

    @Post()
    async createFlight(
        @Body() createFlightDto: CreateFlightDto,
    ): Promise<FlightResponseDto> {
        return this.flightsService.createFlight(createFlightDto);
    }

    @Get()
    async getAllFlights(): Promise<FlightResponseDto[]> {
        return this.flightsService.getAllFlights();
    }

    @Get(':id')
    async getFlightById(
        @Param('id', ParseIntPipe) id: number 
    ): Promise<FlightResponseDto> {
        return this.flightsService.getFlightById(id);
    }
}