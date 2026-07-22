import { IsEnum } from 'class-validator';
import { SeatStatus } from '@prisma/client';

export class UpdateSeatStatusDto {
  @IsEnum(SeatStatus)
  status: SeatStatus;
}