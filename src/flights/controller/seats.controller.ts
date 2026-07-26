import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    UseGuards,
} from '@nestjs/common';

import { SeatsService } from '../service/seats.service';
import { SeatResponseDto } from '../dto/seat-response.dto';
import { UpdateSeatStatusDto } from '../dto/update-seat-status.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('seats')
export class SeatsController {
    constructor(private readonly seatsService: SeatsService){}

    @Get(':seatId')
    async getSeatId(
        @Param('seatId', ParseIntPipe) seatId: number,
    ): Promise<SeatResponseDto> {
        return this.seatsService.getSeatById(seatId);
    }
    
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
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