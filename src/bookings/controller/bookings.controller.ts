import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
} from '@nestjs/common';
import { BookingService } from '../service/bookings.service';
import { LockSeatDto } from '../dto/lock-seat.dto';
import { ConfirmBookingDto } from '../dto/confirm-booking.dto';
import { CancelBookingDto } from '../dto/cancel-booking.dto';

@Controller('bookings')
export class BookingController {
    constructor(
        private readonly bookingService: BookingService,
    ) {}

    @Post('locks')
    lockSeat(
        @Body() lockSeatDto: LockSeatDto,
    ) {
        return this.bookingService.lockSeat(lockSeatDto);
    }


    @Post('confirm')
    confirmBooking(
        @Body() dto: ConfirmBookingDto,
    ){
        return this.bookingService.confirmBooking(dto.bookingId);
    }

    @Post('cancel')
    cancelBooking(
        @Body() dto: CancelBookingDto,
    ){
        return this.bookingService.cancelBooking(dto.bookingId);
    }

    @Get(':id')
    getBookingById(
        @Param('id', ParseIntPipe) bookingId: number
    ) {
        return this.bookingService.getBookingById(bookingId);
    }
}