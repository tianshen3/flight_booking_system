import { IsInt, Min } from 'class-validator';

export class CreateBookingDto {
  @IsInt()
  @Min(1)
  userId: number;

  @IsInt()
  @Min(1)
  flightId: number;

  @IsInt()
  @Min(1)
  seatId: number;
}
