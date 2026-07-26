import { Role } from '@prisma/client';

export interface JwtPayload {
    userId: number;
    email: string;
    role: Role;
}