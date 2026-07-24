import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { BookingRepository } from '../repositories/booking.repository';
import { UserRepository } from 'src/users/repositories/user.repository';
import { FlightRepository } from 'src/flights/repositories/flight.repository';
import { SeatRepository } from 'src/flights/repositories/seats.repository';
import { LockSeatDto } from '../dto/lock-seat.dto';
import { Booking, BookingStatus, SeatStatus } from '@prisma/client';
import { SeatLockService } from './seat-lock.service';
import { LockSeatResponseDto } from '../dto/lock-seat-response.dto';
import { ConfirmBookingDto } from '../dto/confirm-booking.dto';
import { BookingResponseDto } from '../dto/booking-response.dto';

@Injectable()
export class BookingService{
    constructor(
        private readonly bookingRepository: BookingRepository,
        private readonly userRepository: UserRepository,
        private readonly flightRepository: FlightRepository,
        private readonly seatRepository: SeatRepository,
        private readonly seatLockService: SeatLockService,
    ){}

    private maptoResponseDto(booking: Booking): BookingResponseDto{
        return {
            bookingId: booking.id,
            userId: booking.userId,
            flightId: booking.flightId,
            seatId: booking.seatId,
            status: booking.status,
        }
    }
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

    //for confirm booking
    async confirmBooking(
        bookingId: number,
    ): Promise<BookingResponseDto> {
        const booking = await this.bookingRepository.findById(bookingId);

        if(!booking){
            throw new NotFoundException('Booking not found');
        }

        if (booking.status !== BookingStatus.LOCKED) {
            throw new BadRequestException(
                'Booking is not in LOCKED state.',
            );
        }

        const hasLock = await this.seatLockService.hasLock(
            booking.flightId,
            booking.seatId,
        );

        if (!hasLock) {
            throw new BadRequestException(
                'Seat lock has expired.',
            );
        }

        const updatedBooking = await this.bookingRepository.updateStatus(
            booking.id,
            BookingStatus.CONFIRMED,
        );
        await this.seatRepository.updateSeatStatus(
            booking.seatId,
            SeatStatus.BOOKED,
        );

        return this.maptoResponseDto(booking);
    }

    //cancelling a booking
    async cancelBooking(bookingId: number): Promise<BookingResponseDto> {

        //find booking with the given id
        const booking = await this.bookingRepository.findById(bookingId);
        if(!booking){
            throw new NotFoundException('Booking not Found');
        }

        //validating the booking status
        if(booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.EXPIRED){
            throw new BadRequestException(`Cannot cancel a ${booking.status.toLowerCase()} booking`);

        }

        //updating the status to cancelled
        const cancelledBooking = await this.bookingRepository.updateStatus(
            booking.id,
            BookingStatus.CANCELLED,
        );

        //updating the seat status to avaliable
        await this.seatRepository.updateSeatStatus(
            booking.seatId,
            SeatStatus.AVAILABLE,
        )


        //releasing the redis lock
        await this.seatLockService.releaseLock(
            booking.flightId,
            booking.seatId,
        );

        return this.maptoResponseDto(cancelledBooking);
    }

    //booking query
    async getBookingById(bookingId: number): Promise<BookingResponseDto> {

        //find the booking
        const booking = await this.bookingRepository.findById(bookingId);
        if(!booking){
            throw new NotFoundException('Booking not Found');
        }

        return this.maptoResponseDto(booking);
    }

    //get all the bookings of the user
    async getUserBookings(userId: number): Promise<BookingResponseDto[]>{
        const bookings = await this.bookingRepository.findUserBookings(userId);

        return bookings.map((booking) => this.maptoResponseDto(booking));
    } 
}