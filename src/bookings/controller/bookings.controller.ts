import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { BookingService } from '../service/bookings.service';
import { LockSeatDto } from '../dto/lock-seat.dto';
import { ConfirmBookingDto } from '../dto/confirm-booking.dto';
import { CancelBookingDto } from '../dto/cancel-booking.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { ApiTags } from '@nestjs/swagger';
import { BookingStatus, Role } from '@prisma/client';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingController {
    constructor(
        private readonly bookingService: BookingService,
    ) {}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Get('admin')
    getAllBookingsAdmin(
        @Query('flightId') flightId?: string,
        @Query('status') status?: BookingStatus,
    ) {
        return this.bookingService.getAllBookingsAdmin(
            flightId ? parseInt(flightId, 10) : undefined,
            status,
        );
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Patch('admin/:id/cancel')
    adminCancelBooking(
        @Param('id', ParseIntPipe) bookingId: number,
    ) {
        return this.bookingService.adminCancelBooking(bookingId);
    }

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