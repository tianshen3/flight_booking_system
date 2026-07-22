import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

@Injectable()
export class FlightRepository {
    constructor(private readonly prisma: PrismaService){}

    //create a flight method this is write only
    async create(data : {
        flightNumber: string;
        origin: string;
        destination: string;
        departureTime: Date;
        arrivalTime: Date;
    }) {
        return this.prisma.flight.create({
            data,
        });
    }


    //method to get all the flights readonly
    async findAll() {
        return this.prisma.flight.findMany({
            orderBy: {
                departureTime: 'asc',
            },
        });
    }

    //get details about a particular flight through its id ,readonly
    async findById(id: number){
        return this.prisma.flight.findUnique({
            where: {
                id,
            }, 
        });
    }

    //find by flight number method
    async findByFlightNumber(flightNumber: string){
        return this.prisma.flight.findUnique({
            where: {
                flightNumber,
            },
        });
    }
}