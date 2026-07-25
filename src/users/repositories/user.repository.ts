import { Injectable } from  '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { UpdateUserDto } from '../dto/update-user.dto';

//decorator which makes this class  a provider
@Injectable() 
export class UserRepository {
    constructor(private readonly prisma: PrismaService){}

    async findById(id: number) {
        return this.prisma.user.findUnique({
            where: {
                id,
            },
        });
    }

    //this email was uniquely set in schema
    async findByEmail(email: string){
        return this.prisma.user.findUnique({
            where: {
                email,
            },
        });
    }

    //method to get all users
    async findAll() {
        return this.prisma.user.findMany();
    }

    //for creating a user
    async create(data : {
        name: string;
        email: string;
        password: string;
        clvScore: number;
    }){
        return this.prisma.user.create({
            data,
        });
    }

    //for updating the user
    async update(
        id: number,
        data: UpdateUserDto
    ){
        return this.prisma.user.update({
            where: {
                id,
            },
            data,
        })
    }

    //for deleting a user
    async delete(id: number){
        return this.prisma.user.delete({
            where: {
                id,
            },
        });
    }
}

//reading and writing logic belongs in the repository