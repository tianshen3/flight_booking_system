import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
} from '@nestjs/common';
import { WaitlistService } from '../service/waitlist.service';
import { JoinWaitlistDto } from '../dto/join-waitlist.dto';

@Controller('waitlist')
export class WaitlistController{
    constructor(
        private readonly waitlistService: WaitlistService
    ){}

    @Post()
    joinWaitlist(
        @Body() dto: JoinWaitlistDto,
    ){
        return this.waitlistService.joinWaitlist(dto);
    }

    @Delete(':id')
    leaveWaitlist(
        @Param('id', ParseIntPipe) id: number,
    ){
        return this.waitlistService.leaveWailtlist(id);
    }

    @Get('flights/:flightId')
    getFlightWaitlist(
        @Param('flightId', ParseIntPipe) flightId: number,
    ) {
        return this.waitlistService.getFlightWaitlist(flightId);
    }
}