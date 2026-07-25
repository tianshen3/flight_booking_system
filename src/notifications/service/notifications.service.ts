import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationService{
    
    sendBookingConfirmation(){}

    sendBookingCancellation(){}

    sendWaitlistPromotion(){}

    sendSeatReassignment(){}
}