import { Module } from '@nestjs/common';
import { AuthController } from './controller/auth.controller';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants/auth.constants';
import { AuthService } from './service/auth.service';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: {
        expiresIn: '1h', 
      },
    }),
  ],
  controllers: [AuthController],
  providers:[AuthService],
  exports:[
    AuthService,
    JwtModule,
    PassportModule,
  ]
})
export class AuthModule {}
