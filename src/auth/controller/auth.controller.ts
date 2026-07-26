import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { LoginDto } from '../dto/login.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ){}

    @Post('register')
    async register(
        @Body() registerDto: RegisterDto,
    ): Promise<AuthResponseDto> {
        return this.authService.register(registerDto);
    }

    @Post('login')
    async login(
        @Body() loginDto: LoginDto,
    ): Promise<AuthResponseDto> {
        return this.authService.login(loginDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    profile(
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.authService.profile(user.userId);
    }

}
