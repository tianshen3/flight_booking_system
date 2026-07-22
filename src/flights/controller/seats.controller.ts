import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Patch,
} from '@nestjs/common';

import { SeatsService } from '../service/seats.service';
import { SeatResponseDto } from '../dto/seat-response.dto';
import { UpdateSeatStatusDto } from '../dto/update-seat-status.dto';

@Controller('seats')
export class SeatsController {
    constructor(private readonly seatsService: SeatsService){}

    @Get(':seatId')
    async getSeatId(
        @Param('seatId', ParseIntPipe) seatId: number,
    ): Promise<SeatResponseDto> {
        return this.seatsService.getSeatById(seatId);
    }
    
    @Patch(':seatId')
    async updateSeatStatus(
        @Param('seatId', ParseIntPipe) seatId: number,
        @Body() updateSeatStatus: UpdateSeatStatusDto,
    ): Promise<SeatResponseDto> {
        return this.seatsService.updateSeatStatus(
            seatId,
            updateSeatStatus.status
        );
    }

}