import { IsEmail, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

//data transfer object instead of raw json
export class CreateUserDto{
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    email: string;

    @IsInt()
    @Min(0)
    clvScore: number;
}