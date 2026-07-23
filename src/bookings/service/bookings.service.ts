import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { BookingRepository } from '../repositories/booking.repository';
import { UserRepository } from 'src/users/repositories/user.repository';
import { FlightRepository } from 'src/flights/repositories/flight.repository';
import { SeatRepository } from 'src/flights/repositories/seats.repository';
import { LockSeatDto } from '../dto/lock-seat.dto';
import { BookingStatus, SeatStatus } from '@prisma/client';
import { SeatLockService } from './seat-lock.service';
import { LockSeatResponseDto } from '../dto/lock-seat-response.dto';

@Injectable()
export class BookingService{
    constructor(
        private readonly bookingRepository: BookingRepository,
        private readonly userRepository: UserRepository,
        private readonly flightRepository: FlightRepository,
        private readonly seatRepository: SeatRepository,
        private readonly seatLockService: SeatLockService,
    ){}

    //seat locking and booking
    async lockSeat(lockSeatDto: LockSeatDto): Promise<LockSeatResponseDto> {

        //destructure of lockSeatDto
        const { userId, flightId, seatId } = lockSeatDto;

        //checking user existence
        const user = await this.userRepository.findById(userId);
        if(!user){
            throw new NotFoundException('User not found');
        }

        //checking fligth existence
        const flight = await this.flightRepository.findById(flightId);
        if(!flight){
            throw new NotFoundException('Flight not found');
        }

        //checking seat existence
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

        //accquiring redis lock
        const locked = await this.seatLockService.lockSeat(
            flightId,
            seatId,
            userId,
        );

        if(!locked){
            throw new ConflictException(
                'Seat is temporarily locked by another user.',
            );
        }

        //create a booking object of the locked type status
        const booking = await this.bookingRepository.create({
            userId,
            flightId,
            seatId,
            status: BookingStatus.LOCKED,
        });


        //updating the seatstatus to be locked
        await this.seatRepository.updateSeatStatus(
            seatId,
            SeatStatus.LOCKED,
        );

        return {
            bookingId: booking.id,
            seatId: booking.seatId,
            status: booking.status,
        };
    }
}