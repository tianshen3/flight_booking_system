import { IsInt, IsPositive } from 'class-validator';

export class CancelBookingDto {
  @IsInt()
  @IsPositive()
  bookingId: number;
}