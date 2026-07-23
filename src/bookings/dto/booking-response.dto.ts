import { BookingStatus } from '@prisma/client';

export class BookingResponseDto {
    bookingId: number;
    userId: number;
    flightId: number;
    seatId: number;
    status: BookingStatus;
}