import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

export interface SystemStatsResponse {
  users: {
    total: number;
    customers: number;
    admins: number;
    active: number;
    inactive: number;
  };
  flights: {
    total: number;
  };
  bookings: {
    total: number;
    locked: number;
    confirmed: number;
    cancelled: number;
    expired: number;
  };
  waitlist: {
    total: number;
  };
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getSystemStats(): Promise<SystemStatsResponse> {
    const [
      totalUsers,
      customerUsers,
      adminUsers,
      activeUsers,
      inactiveUsers,
      totalFlights,
      totalBookings,
      lockedBookings,
      confirmedBookings,
      cancelledBookings,
      expiredBookings,
      totalWaitlist,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      this.prisma.user.count({ where: { role: 'ADMIN' } }),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { isActive: false } }),
      this.prisma.flight.count(),
      this.prisma.booking.count(),
      this.prisma.booking.count({ where: { status: 'LOCKED' } }),
      this.prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      this.prisma.booking.count({ where: { status: 'CANCELLED' } }),
      this.prisma.booking.count({ where: { status: 'EXPIRED' } }),
      this.prisma.waitlist.count(),
    ]);

    return {
      users: {
        total: totalUsers,
        customers: customerUsers,
        admins: adminUsers,
        active: activeUsers,
        inactive: inactiveUsers,
      },
      flights: {
        total: totalFlights,
      },
      bookings: {
        total: totalBookings,
        locked: lockedBookings,
        confirmed: confirmedBookings,
        cancelled: cancelledBookings,
        expired: expiredBookings,
      },
      waitlist: {
        total: totalWaitlist,
      },
    };
  }
}
