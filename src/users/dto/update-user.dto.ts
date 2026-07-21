import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

//the partialtype makes the values optional the exact thing required for updates
//since we want to update only the fields the user wants;

export class UpdateUserDto extends PartialType(CreateUserDto){}