import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    UseGuards,
} from '@nestjs/common';
import { WaitlistService } from '../service/waitlist.service';
import { JoinWaitlistDto } from '../dto/join-waitlist.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('waitlist')
export class WaitlistController{
    constructor(
        private readonly waitlistService: WaitlistService
    ){}

    @UseGuards(JwtAuthGuard)
    @Post()
    joinWaitlist(
        @Body() dto: JoinWaitlistDto,
        @CurrentUser('userId') userId: number,
    ){
        return this.waitlistService.joinWaitlist(
            dto,
            userId,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    leaveWaitlist(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser('userId') userId: number,
    ){
        return this.waitlistService.leaveWaitlist(
            id,
            userId,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get('flights/:flightId')
    getFlightWaitlist(
        @Param('flightId', ParseIntPipe) flightId: number,
    ) {
        return this.waitlistService.getFlightWaitlist(flightId);
    }
}