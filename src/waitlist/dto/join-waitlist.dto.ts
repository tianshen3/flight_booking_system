import { IsInt, Min } from 'class-validator';

export class JoinWaitlistDto {

  @IsInt()
  @Min(1)
  flightId: number;
}