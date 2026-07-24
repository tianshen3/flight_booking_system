import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class WaitlistRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.WaitlistCreateInput) {
    return this.prisma.waitlist.create({
      data,
    });
  }

  async findByFlight(flightId: number) {
    return this.prisma.waitlist.findMany({
      where: {
        flightId,
      },
      orderBy: [
        {
          clvScore: 'desc',
        },
        {
          createdAt: 'asc',
        }
      ]
    });
  }
  
  async remove(id: number) {
    return this.prisma.waitlist.delete({
      where: {
        id,
      },
    });
  }

  async exists(userId: number, flightId: number) {
    const waitlistEntry = await this.prisma.waitlist.findFirst({
      where: {
        userId,
        flightId,
      },
    });

    return waitlistEntry !== null;
  }

  //find by id method
  async findById(id: number){
    return this.prisma.waitlist.findUnique({
      where: {
        id,
      },
    });
  }

  //return the waitlist size
  async count(flightId: number){
    return this.prisma.waitlist.count({
      where: {
        flightId,
      },
    });
  }

  //clear the entire waitlists of the flight
  async clearFlight(flightId: number){
    return this.prisma.waitlist.deleteMany({
      where: {
        flightId,
      },
    });
  }
}