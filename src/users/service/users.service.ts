import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { UserResponseDto } from '../dto/user-response.dto';
import { User } from '@prisma/client';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UsersService { 
    constructor(private readonly userRepository: UserRepository){}

    private mapToResponseDto(user: User): UserResponseDto {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            clvScore: user.clvScore,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt,
        };
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

    //the update user method
    async updateUser(
        id: number,
        updateUserDto: UpdateUserDto,
    ): Promise<UserResponseDto>{

        //finding user with this id
        const user = await this.userRepository.findById(id);
        if(!user){
            throw new NotFoundException('User not found');
        }

        //checking if the email requires update
        if(updateUserDto.email){

            //checking if the email already exists or not
            const existingUser =  await this.userRepository.findByEmail(updateUserDto.email);
            if(existingUser && existingUser.id !== id){
                throw new ConflictException('Email already exists');
            }
        }

        const updatedUser = await this.userRepository.update(id, updateUserDto);

        return this.mapToResponseDto(updatedUser);
    }

    //delete user method
    async deleteUser(id: number): Promise<{ message: string}> {
        const user = await this.userRepository.findById(id);

        if(!user){
            throw new NotFoundException('User not exist');
        }

        await this.userRepository.delete(id);

        return {
            message: 'User Deleted Successfully',
        }
    };
    
    //method to get user by email
    async getUserByEmail(email: string){
        return this.userRepository.findByEmail(email);
    }
}