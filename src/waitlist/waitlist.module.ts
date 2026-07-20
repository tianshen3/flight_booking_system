import { Module } from '@nestjs/common';
import { WaitlistRepository } from './repository/waitlist.repository';

@Module({
  providers: [WaitlistRepository],
  exports: [WaitlistRepository],
})

export class WaitlistModule {}