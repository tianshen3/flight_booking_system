import { Module } from '@nestjs/common';
import { NotificationService } from './service/notifications.service';
import { ConsoleNotificationProvider } from './providers/console-notifications.provider';

@Module({
    providers:[
        NotificationService,
        ConsoleNotificationProvider,
    ],
    exports: [
        NotificationService,
    ],
})
export class NotificationModule{};