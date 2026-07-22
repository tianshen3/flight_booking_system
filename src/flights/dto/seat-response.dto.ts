import { SeatStatus } from "@prisma/client";

export class SeatResponseDto {
    id: number;
    flightId: number;
    seatNumber: string;
    status: SeatStatus;
}