import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { BookingRepository } from '../repositories/booking.repository';
import { UserRepository } from 'src/users/repositories/user.repository';
import { FlightRepository } from 'src/flights/repositories/flight.repository';
import { SeatRepository } from 'src/flights/repositories/seats.repository';
import { LockSeatDto } from '../dto/lock-seat.dto';
import { SeatStatus } from '@prisma/client';

@Injectable()
export class BookingService{
    constructor(
        private readonly bookingRepository: BookingRepository,
        private readonly userRepository: UserRepository,
        private readonly flightRepository: FlightRepository,
        private readonly seatRepository: SeatRepository,
    ){}

    //seat locking and booking
    async lockSeat(lockSeatDto: LockSeatDto){

        //destructure of lockSeatDto
        const { userId, flightId, seatId } = lockSeatDto;

        const user = await this.userRepository.findById(userId);
        if(!user){
            throw new NotFoundException('User not found');
        }

        const flight = await this.flightRepository.findById(flightId);
        if(!flight){
            throw new NotFoundException('Flight not found');
        }

        const seat = await this.seatRepository.findBySeatId(seatId);
        if(!seat){
            throw new NotFoundException('Seat not found');
        }

        //seat must belong to this flight
        if(seat.flightId !== flight.id){
            throw new BadRequestException('Seat not belong to this flight');
        }

        //seat must be available
        if(seat.status !== SeatStatus.AVAILABLE){
            throw new BadRequestException('Seat not avaliable');
        }
    }
}