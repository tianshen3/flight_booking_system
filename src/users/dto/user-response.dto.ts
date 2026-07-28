import { Role } from '@prisma/client';

export class UserResponseDto {
  id: number;
  name: string;
  email: string;
  clvScore: number;
  role: Role;
  isActive: boolean;
  createdAt: Date;
}