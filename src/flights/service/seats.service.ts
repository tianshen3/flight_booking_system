import { Injectable, NotFoundException } from '@nestjs/common';
import { SeatRepository } from '../repositories/seats.repository';
import { Seat } from '@prisma/client';
import { SeatResponseDto } from '../dto/seat-response.dto';
import { FlightRepository } from '../repositories/flight.repository';

@Injectable()
export class SeatsService{
    constructor(
        private readonly seatRepository: SeatRepository,
        private readonly flightRepository: FlightRepository,
    ) {}

    private mapToResponseDto(seat: Seat) : SeatResponseDto {
        return {
            id: seat.id,
            flightId: seat.flightId,
            seatNumber: seat.seatNumber,
            status: seat.status,
        }
    }

    //get all seats by flight id
    async getSeatsByFlightId(flightId: number): Promise<SeatResponseDto[]> {

        const flight = await this.flightRepository.findById(flightId);
        if(!flight){
            throw new NotFoundException('Flight Not Found');
        }

        const seats = await this.seatRepository.findAllByFlight(flight.id);

        return seats.map((seat) => this.mapToResponseDto(seat));
    }


}
