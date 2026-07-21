import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Patch,
    ParseIntPipe,
} from '@nestjs/common';

import { UsersService } from '../service/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly userServices: UsersService) {}

    //the create user route
    @Post()
    async createUser(
        @Body() createUserDto: CreateUserDto,
    ){
        return this.userServices.createUser(createUserDto);
    }

    
}

