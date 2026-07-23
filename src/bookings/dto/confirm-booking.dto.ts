import { IsInt, IsPositive } from 'class-validator';

export class ConfirmBookingDto {
    @IsInt()
    @IsPositive()
    bookingId: number;
}