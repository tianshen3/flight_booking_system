import { Module } from '@nestjs/common';
import { WaitlistRepository } from './repository/waitlist.repository';
import { UsersModule } from 'src/users/users.module';
import { FlightsModule } from 'src/flights/flights.module';
import { BookingModule } from 'src/bookings/bookings.module';
import { WaitlistController } from './controller/waitlist.controller';
import { WaitlistService } from './service/waitlist.service';
import { WaitlistRedisService } from './service/waitlist-redis.service';

@Module({
  imports: [
    UsersModule,
    FlightsModule,
    BookingModule,
  ],
  controllers: [
    WaitlistController,
  ],
  providers: [
    WaitlistRepository,
    WaitlistService,
    WaitlistRedisService,
  ],
  exports: [
    WaitlistRepository,
    WaitlistService,
    WaitlistRedisService,
  ],
})

export class WaitlistModule {}