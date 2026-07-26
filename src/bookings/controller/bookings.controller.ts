import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { BookingService } from '../service/bookings.service';
import { LockSeatDto } from '../dto/lock-seat.dto';
import { ConfirmBookingDto } from '../dto/confirm-booking.dto';
import { CancelBookingDto } from '../dto/cancel-booking.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from 'src/auth/interfaces/authenticated-request.interface';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('bookings')
export class BookingController {
    constructor(
        private readonly bookingService: BookingService,
    ) {}

    @UseGuards(JwtAuthGuard)
    @Post('locks')
    lockSeat(
        @Body() lockSeatDto: LockSeatDto,
        @CurrentUser('userId') userId: number,
    ) {
        return this.bookingService.lockSeat(
            lockSeatDto,
            userId,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Post('confirm')
    confirmBooking(
        @Body() dto: ConfirmBookingDto,
        @CurrentUser('userId') userId: number,
    ){
        return this.bookingService.confirmBooking(
            dto.bookingId,
            userId,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Post('cancel')
    cancelBooking(
        @Body() dto: CancelBookingDto,
        @CurrentUser('userId') userId: number,
    ){
        return this.bookingService.cancelBooking(
            dto.bookingId,
            userId,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getuserBookings(
       @CurrentUser('userId') userId: number,
    ){
        return this.bookingService.getUserBookings(
            userId,
        );
    }
    
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    getBookingById(
        @Param('id', ParseIntPipe) bookingId: number,
        @CurrentUser('userId') userId: number,
    ) {
        return this.bookingService.getBookingById(
            bookingId,
            userId,
        );
    }

    
}