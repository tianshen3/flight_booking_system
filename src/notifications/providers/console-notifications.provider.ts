import { Injectable } from '@nestjs/common';

@Injectable()
export class ConsoleNotificationProvider{
    
    sendBookingConfirmation(
        userId: number,
        bookingId: number,
    ){
        console.log(
            `[BOOKING CONFIRMED] User ${userId} - Booking ${bookingId} has been confirmed.`,
        );
    }

    sendBookingCancellation(
        userId: number,
        bookingId: number,
    ){
        console.log(
            `[BOOKING CANCELLED] User ${userId} - Booking ${bookingId} has been cancelled.`,
        );
    }

    sendWaitlistPromotion(
        userId: number,
        flightId: number,
    ) {
        console.log(
            `[WAITLIST PROMOTION] User ${userId} has been promoted from the waitlist for Flight ${flightId}.`,
        )
    }

    sendSeatReassignment(
        userId: number,
        seatId: number,
        flightId: number,
    ) {
        console.log(
            `[SEAT REASSIGNED] Seat ${seatId} on Flight ${flightId} has been assigned to User ${userId}.`,
        );
    }
}