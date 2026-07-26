import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { FlightsService } from '../service/flights.service';
import { CreateFlightDto } from '../dto/create-flight.dto';
import { FlightResponseDto } from '../dto/flight-response.dto';
import { UpdateFlightDto } from '../dto/update-flight.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Flights')
@Controller('flights')
export class FlightsController {
    constructor(private readonly flightsService: FlightsService){}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
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

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Patch(':id')
    async updateFlight(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateFlightDto: UpdateFlightDto,
    ) : Promise<FlightResponseDto> {
        return this.flightsService.updateFlight(id, updateFlightDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Delete(':id')
    async deleteFlight(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<{message: string}>{
        return this.flightsService.deleteFlight(id);
    }
}