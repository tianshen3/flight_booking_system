import { BookingStatus } from "@prisma/client";

export class LockSeatResponseDto {
    bookingId: number;
    seatId: number;
    status: BookingStatus;
}