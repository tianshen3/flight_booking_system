import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    ParseIntPipe,
    Delete,
    UseGuards,
} from '@nestjs/common';

import { UsersService } from '../service/users.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly userServices: UsersService) {}


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
    @UseGuards(JwtAuthGuard)
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

