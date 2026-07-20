import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

//PrismaService class extends the prismaclient class and sort of warps around it
//onMdouleInit and onModuleDestroy are the lifecycle hooks/interfaces for the database connection provided by the nestjs
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async isHealthy(): Promise<boolean> {
    try {
      //select 1 is the univeral light weight sql query and asks postgres are you alive
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
