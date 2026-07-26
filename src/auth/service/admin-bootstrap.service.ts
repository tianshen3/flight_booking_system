import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminBootstrapService implements OnModuleInit {
    private readonly logger = new Logger(AdminBootstrapService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
    ) {}

    async onModuleInit() {
        const shouldBootstrap =
            this.configService.get<string>('BOOTSTRAP_ADMIN') === 'true';

        if (!shouldBootstrap) {
            return;
        }

        const email = this.configService.get<string>('ADMIN_EMAIL');
        const password = this.configService.get<string>('ADMIN_PASSWORD');
        const name = this.configService.get<string>('ADMIN_NAME');

        if (!email || !password || !name) {
            this.logger.warn(
                'BOOTSTRAP_ADMIN is enabled, but ADMIN credentials are missing.',
            );
            return;
        }

        const existingAdmin = await this.prisma.user.findUnique({
            where: { email },
        });

        if (existingAdmin) {
            this.logger.log(`Admin already exists: ${email}`);
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await this.prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: Role.ADMIN,
                clvScore: 1000,
            },
        });

        this.logger.log(`Admin account created: ${email}`);
    }
}