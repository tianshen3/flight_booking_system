import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

//@Gobal tell nestjs this service is available everywhere no need for imports
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
