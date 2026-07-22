import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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
    
    //get flightbyId method
    async getFlightById(id: number): Promise<FlightResponseDto> {

        const flight = await this.flightRepository.findById(id);
        if(!flight){
            throw new NotFoundException('Flight not found');
        }

        return this.mapToResponseDto(flight);
    }

    // method to get all flights
    async getAllFlights() : Promise<FlightResponseDto[]> {

        const flights = await this.flightRepository.findAll();

        return flights.map((flight) => this.mapToResponseDto(flight));
    }
}