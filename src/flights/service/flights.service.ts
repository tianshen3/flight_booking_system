import { ConflictException, Injectable } from '@nestjs/common';
import { FlightRepository } from '../repositories/flight.repository';
import { CreateFlightDto } from '../dto/create-flight.dto';
import { FlightResponseDto } from '../dto/flight-response.dto';
import { Flight } from '@prisma/client';

@Injectable()
export class FlightsService{
    constructor(private readonly flightRepository: FlightRepository){}

    private mapToResponseDto(flight: Flight): FlightResponseDto {
            return {
                id: flight.id,
                flightNumber: flight.flightNumber,
                origin: flight.origin,
                destination: flight.destination,
                departureTime: flight.departureTime,
                arrivalTime: flight.arrivalTime,
            };
    }
    //create flight method
    async createFlight(createFlightDto: CreateFlightDto): Promise<FlightResponseDto> {

        const existingFlight = await this.flightRepository.findByFlightNumber(createFlightDto.flightNumber);
        if(existingFlight){
            throw new ConflictException('Flight already exists');
        }

        const flight = await this.flightRepository.create({
            flightNumber: createFlightDto.flightNumber,
            origin: createFlightDto.origin,
            destination: createFlightDto.destination,
            departureTime: new Date(createFlightDto.departureTime),
            arrivalTime: new Date(createFlightDto.arrivalTime),
        });

        return this.mapToResponseDto(flight);
    }
}