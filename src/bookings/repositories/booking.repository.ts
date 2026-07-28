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
    async findByUserId(userId: number){
        return this.prisma.booking.findMany({
            where: {
                userId,
            },
        });
    }

    //adding a method for cron job to delete the stale bookings and free the seats
    async findExpiredLockedBookings(expiryTime: Date){
        return this.prisma.booking.findMany({
            where: {
                status: BookingStatus.LOCKED,
                createdAt: {
                    lt: expiryTime,
                }
            }
        })
    }

    //find all the bookings of the user
    async findUserBookings(userId: number) {
        return this.prisma.booking.findMany({
            where: {
                userId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    //find the confirmed booking of hte user
    async findConfirmedBooking(
        userId: number,
        flightId: number,
    ) {
        return this.prisma.booking.findFirst({
            where: {
                userId,
                flightId,
                status: BookingStatus.CONFIRMED,
            },
        });
    }

    //find all bookings for Admin with optional filters
    async findAllBookings(flightId?: number, status?: BookingStatus) {
        return this.prisma.booking.findMany({
            where: {
                ...(flightId ? { flightId } : {}),
                ...(status ? { status } : {}),
            },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                flight: {
                    select: {
                        id: true,
                        flightNumber: true,
                    },
                },
                seat: {
                    select: {
                        id: true,
                        seatNumber: true,
                    },
                },
            },
        });
    }
}
