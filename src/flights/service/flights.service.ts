import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { FlightRepository } from '../repositories/flight.repository';
import { CreateFlightDto } from '../dto/create-flight.dto';
import { FlightResponseDto } from '../dto/flight-response.dto';
import { Flight } from '@prisma/client';
import { UpdateFlightDto } from '../dto/update-flight.dto';
import { DeleteResponseDto } from '../dto/delete-response.dto';

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

    //method to update the flight details
    async updateFlight(
        id: number,
        updateFlightDto: UpdateFlightDto,
    ): Promise<FlightResponseDto> {

        const existingFlight = await this.flightRepository.findById(id);
        if(!existingFlight){
            throw new NotFoundException('Flight Not Found');
        }

        //conditionally building the obeject as the update body can have anything and
        // if the time is there it is in string and there is need of date type for prisma
        const updateData = {
            ...updateFlightDto,
            deparutureTime: updateFlightDto.departureTime
                ? new Date(updateFlightDto.departureTime)
                : undefined,
            
            arrivalTime: updateFlightDto.arrivalTime
                ? new Date(updateFlightDto.arrivalTime)
                : undefined,
        };

        //finally the update db call
        const updatedFlight = await this.flightRepository.update(
            id,
            updateData,
        )

        //return mapped response
        return this.mapToResponseDto(updatedFlight);
    }

    //method to delete a flight
    async deleteFlight(id: number): Promise<DeleteResponseDto> {

        const existingFlight = await this.flightRepository.findById(id);
        if(!existingFlight){
            throw new NotFoundException('Flight does not exist');
        }

        await this.flightRepository.delete(id);

        return {
            message: 'Flight deleted successfully',
        }
    }
}