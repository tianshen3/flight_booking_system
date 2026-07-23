import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './common/health/health.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { UsersModule } from './users/users.module';
import { FlightsModule } from './flights/flights.module';
import { BookingModule } from './bookings/bookings.module';
import { WaitlistModule } from './waitlist/waitlist.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    RedisModule,
    HealthModule,
    UsersModule,
    FlightsModule,
    BookingModule,
    WaitlistModule
  ],
})
export class AppModule {}
