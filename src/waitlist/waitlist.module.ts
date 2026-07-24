import { forwardRef, Module } from '@nestjs/common';
import { WaitlistRepository } from './repository/waitlist.repository';
import { UsersModule } from 'src/users/users.module';
import { FlightsModule } from 'src/flights/flights.module';
import { BookingModule } from 'src/bookings/bookings.module';
import { WaitlistController } from './controller/waitlist.controller';
import { WaitlistService } from './service/waitlist.service';
import { WaitlistRedisService } from './service/waitlist-redis.service';
import { SeatReassignmentService } from './service/seat-reassignment.service';

@Module({
  imports: [
    UsersModule,
    FlightsModule,
    forwardRef(() => BookingModule),
  ],
  controllers: [
    WaitlistController,
  ],
  providers: [
    WaitlistRepository,
    WaitlistService,
    WaitlistRedisService,
    SeatReassignmentService,
  ],
  exports: [
    WaitlistRepository,
    WaitlistService,
    WaitlistRedisService,
    SeatReassignmentService,
  ],
})

export class WaitlistModule {}