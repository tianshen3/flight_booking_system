import { Injectable, NotFoundException } from '@nestjs/common';
import { SeatRepository } from '../repositories/seats.repository';
import { Seat, SeatStatus } from '@prisma/client';
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
            price: seat.price,
            status: seat.status,
        }
    }

    //get all seats by flight id
    async getSeatsByFlightId(flightId: number): Promise<SeatResponseDto[]> {

        //probably can be reduced to one query
        const flight = await this.flightRepository.findById(flightId);
        if(!flight){
            throw new NotFoundException('Flight Not Found');
        }

        const seats = await this.seatRepository.findAllByFlight(flight.id);

        return seats.map((seat) => this.mapToResponseDto(seat));
    }

    //get a single seat
    async getSeatById(seatId: number): Promise<SeatResponseDto> {
        const seat = await this.seatRepository.findBySeatId(seatId);

        if(!seat){
            throw new NotFoundException('Seat not found');
        }

        return this.mapToResponseDto(seat);
    }

    //update seat status
    async updateSeatStatus(
        seatId: number,
        status: SeatStatus,
    ): Promise<SeatResponseDto> {
       const seat = await this.seatRepository.findBySeatId(seatId);

        if (!seat) {
            throw new NotFoundException('Seat not found');
        }

        const updatedSeat = await this.seatRepository.updateSeatStatus(
            seatId,
            status,
        );

        return this.mapToResponseDto(updatedSeat); 
    }

}
