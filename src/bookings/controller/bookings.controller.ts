import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
    UseGuards,
} from '@nestjs/common';
import { BookingService } from '../service/bookings.service';
import { LockSeatDto } from '../dto/lock-seat.dto';
import { ConfirmBookingDto } from '../dto/confirm-booking.dto';
import { CancelBookingDto } from '../dto/cancel-booking.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('bookings')
export class BookingController {
    constructor(
        private readonly bookingService: BookingService,
    ) {}

    @UseGuards(JwtAuthGuard)
    @Post('locks')
    lockSeat(
        @Body() lockSeatDto: LockSeatDto,
    ) {
        return this.bookingService.lockSeat(lockSeatDto);
    }

    @UseGuards(JwtAuthGuard)
    @Post('confirm')
    confirmBooking(
        @Body() dto: ConfirmBookingDto,
    ){
        return this.bookingService.confirmBooking(dto.bookingId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('cancel')
    cancelBooking(
        @Body() dto: CancelBookingDto,
    ){
        return this.bookingService.cancelBooking(dto.bookingId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('user/:userId')
    getuserBookings(
        @Param('userId', ParseIntPipe) userId: number
    ){
        return this.bookingService.getUserBookings(userId);
    }
    
    @Get(':id')
    getBookingById(
        @Param('id', ParseIntPipe) bookingId: number
    ) {
        return this.bookingService.getBookingById(bookingId);
    }

    
}