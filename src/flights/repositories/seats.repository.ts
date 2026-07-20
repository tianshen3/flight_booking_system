import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { SeatStatus } from '@prisma/client';

@Injectable()
export class SeatRepository{
    constructor(private readonly prisma: PrismaService){}

    //find all seats of particular plane
    async findAllByFlight(flightId: number){
        return this.prisma.seat.findMany({
            where: {
                flightId,
            },
        });
    }

    //query a particular seat
    async findBySeatId(id: number){
        return this.prisma.seat.findUnique({
            where: {
                id,
            },
        });
    }

    //updating a seat status
    async updateSeatStatus(id: number, status: SeatStatus) {
        return this.prisma.seat.update({
            where:{
                id,
            },
            data: {
                status,
            },
        });
    }
}