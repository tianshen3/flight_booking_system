import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Patch,
    ParseIntPipe,
    Delete,
} from '@nestjs/common';

import { UsersService } from '../service/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly userServices: UsersService) {}

    //the create user route
    @Post()
    async createUser(
        @Body() createUserDto: CreateUserDto,
    ): Promise<UserResponseDto> {
        return this.userServices.createUser(createUserDto);
    }

    //get all the users
    @Get()
    async getAllUsers(): Promise<UserResponseDto[]> {
        return this.userServices.getAllUsers();
    }

    //get user with an id
    @Get(':id')
    async getUserById(
        @Param('id', ParseIntPipe) id: number,
        ): Promise<UserResponseDto> {
            return this.userServices.getUserById(id);
    }

    //updating the user
    @Patch(':id')
    async updateUser(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateUserDto: UpdateUserDto,
    ): Promise<UserResponseDto> {
        return this.userServices.updateUser(id, updateUserDto);
    }
    

    //deleting teh user
    @Delete(':id')
    async deleteUser(
        @Param('id', ParseIntPipe) id: number,
    ){
        return this.userServices.deleteUser(id);
    }
}

