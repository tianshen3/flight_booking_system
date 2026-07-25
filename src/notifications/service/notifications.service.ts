import { Injectable } from '@nestjs/common';
import { ConsoleNotificationProvider } from '../providers/console-notifications.provider';

@Injectable()
export class NotificationService{
    
    constructor(
        private readonly consoleNotificationProvider: ConsoleNotificationProvider,
    ){}

    sendBookingConfirmation(
        userId: number,
        bookingId: number,
    ){
        this.consoleNotificationProvider.sendBookingConfirmation(
            userId,
            bookingId,
        );
    }

    sendBookingCancellation(
        userId: number,
        bookingId: number,
    ){
        this.consoleNotificationProvider.sendBookingCancellation(
            userId,
            bookingId,
        );
    }

    sendWaitlistPromotionNotification(
        userId: number,
        flightId: number,
    ){
        this.consoleNotificationProvider.sendWaitlistPromotion(
            userId,
            flightId,
        );
    }

    
}