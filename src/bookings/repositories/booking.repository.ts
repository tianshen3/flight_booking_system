import { Injectable } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

@Injectable()
export class BookingRepository {
    constructor(private readonly prisma: PrismaService) {}

    //create a entry in bookings table
    async create(data: {
        userId: number;
        flightId: number;
        seatId: number;
        status: BookingStatus;
    }) {
        return this.prisma.booking.create({
            data,
        });
    }

    //booking  query by  id
    async findById(id: number) {
        return this.prisma.booking.findUnique({
            where:{
                id,
            },
        });
    }

    //update booking status
    async updateStatus(id: number, status: BookingStatus){
        return this.prisma.booking.update({
            where: {
                id,
            },
            data: {
                status,
            },
        });
    }

    //find all the booking belonging to a particular user
    async findUserBookings(userId: number){
        return this.prisma.booking.findMany({
            where: {
                userId,
            },
        });
    }
}
