import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { User } from '@prisma/client';

@Injectable()
export class UsersService { 
    constructor(private readonly userRepository: UserRepository){}

    private mapToResponseDto(user: User): UserResponseDto {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            clvScore: user.clvScore,
            createdAt: user.createdAt,
        };
    }

    //method to create a user
    async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {

        //checking if the user with current email already exists or not
        const existingUser = await this.userRepository.findByEmail(createUserDto.email);

        if(existingUser) {
            throw new ConflictException('Email already exists');
        }

        //creating user
        const user = await this.userRepository.create(createUserDto);
        
        //mapping prisma model to response dto
        return this.mapToResponseDto(user);
    }

    //method to find user by id;
    async getUserById(id: number): Promise<UserResponseDto>  {

        const user = await this.userRepository.findById(id);
        if(!user){
            throw new NotFoundException('User not found');
        }

        //mapping prisma model to response dto
        return this.mapToResponseDto(user);
    }

    //method to get all users
    async getAllUsers(): Promise<UserResponseDto[]> {

        const users = await this.userRepository.findAll();

        //custom loop way
        // const res: UserResponseDto[] = [];
        // for(const user of users){
        //     res.push({
        //         id: user.id,
        //         name: user.name,
        //         email: user.email,
        //         clvScore: user.clvScore,
        //         createdAt: user.createdAt,
        //     });    
        // }
        // return res;

        //map method
        return users.map((user)=> this.mapToResponseDto(user));
    }
}