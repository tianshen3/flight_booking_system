import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from 'src/users/service/users.service'
import { RegisterDto } from '../dto/register.dto'

import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { LoginDto } from '../dto/login.dto';
import { UserRepository } from 'src/users/repositories/user.repository';

@Injectable()
export class AuthService{
    constructor(
        private readonly userRepository: UserRepository, 
        private readonly jwtService: JwtService,
    ){}

    
    //authentication for user registration
    async register(registerDto: RegisterDto): Promise<AuthResponseDto>{

        const { name, email, password} = registerDto;

        //checking the user with this email
        const existingUser = await this.userRepository.findByEmail(email);
        if(existingUser){
            throw new ConflictException('User with this email already exists');
        }

        //hashing the password
        const hashedPassword = await bcrypt.hash(
            password,
            10,
        );

        //saving it in the db
        const user = await this.userRepository.create({
            name: name,
            email: email,
            password: hashedPassword,
            clvScore: 0,
            role: Role.CUSTOMER,
        });

        //generating jwt
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        }
        const accessToken = await this.jwtService.signAsync(payload);

        //return this response
        return {
            accessToken,
            expiresIn: 3600,
        }
    }

    //authentication for user login
    async login(loginDto: LoginDto): Promise<AuthResponseDto> {

        const { email, password } = loginDto;

        //checking the the existence of the user
        const user = await this.userRepository.findByEmail(email);
        if(!user){
            throw new UnauthorizedException('Invalid email.');
        }

        //validating the password
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password,
        );
        if(!isPasswordValid){
            throw new UnauthorizedException('Invalid Password');
        }

        //generating jwt
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        }
        const accessToken = await this.jwtService.signAsync(payload);

        //return this response
        return {
            accessToken,
            expiresIn: 3600,
        }
        
    }
}