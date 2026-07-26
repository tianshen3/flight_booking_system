import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
} from '@nestjs/common';
import { FlightsService } from '../service/flights.service';
import { CreateFlightDto } from '../dto/create-flight.dto';
import { FlightResponseDto } from '../dto/flight-response.dto';
import { UpdateFlightDto } from '../dto/update-flight.dto';

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

    @Patch(':id')
    async updateFlight(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateFlightDto: UpdateFlightDto,
    ) : Promise<FlightResponseDto> {
        return this.flightsService.updateFlight(id, updateFlightDto);
    }

    @Delete(':id')
    async deleteFlight(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<{message: string}>{
        return this.flightsService.deleteFlight(id);
    }
}