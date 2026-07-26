import { IsInt, IsPositive } from "class-validator";

export class LockSeatDto{

    @IsInt()
    @IsPositive()
    flightId: number;

    @IsInt()
    @IsPositive()
    seatId: number;
}