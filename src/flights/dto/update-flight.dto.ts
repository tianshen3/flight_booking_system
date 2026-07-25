import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateFlightDto {
  
  @IsOptional()  
  @IsString()
  @IsNotEmpty()
  flightNumber: string;

  @IsOptional()  
  @IsString()
  @IsNotEmpty()
  origin: string;

  @IsOptional()  
  @IsString()
  @IsNotEmpty()
  destination: string;

  @IsOptional()  
  @IsDateString()
  departureTime: string;

  @IsOptional()  
  @IsDateString()
  arrivalTime: string;
}