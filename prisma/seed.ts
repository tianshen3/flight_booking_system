import {
  PrismaClient,
  Prisma,
  User,
  Flight,
  Seat,
  Booking,
  Waitlist,
  SeatStatus,
  BookingStatus,
} from "@prisma/client";
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();


async function seedUsers(): Promise<User[]> {
  const hashedPassword = await bcrypt.hash('password123', 10);
  const usersData: Prisma.UserCreateManyInput[] = [];

  for (let i = 1; i <= 100; i++) {
    usersData.push({
      name: `User ${i}`,
      email: `user${i}@aerolock.dev`,
      password: hashedPassword,
      clvScore: Math.floor(Math.random() * 1000) + 1,
    });
  }

  await prisma.user.createMany({ data: usersData });
  const users = await prisma.user.findMany({ orderBy: { id: 'asc' } });

  console.log(`✅ Created ${users.length} users`);
  return users;
}

async function seedFlights(): Promise<Flight[]> {
  const now = new Date();

  const flightData = [
    {
      flightNumber: "AI101",
      origin: "Delhi",
      destination: "Mumbai",
      departureTime: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      arrivalTime: new Date(now.getTime() + 26 * 60 * 60 * 1000),
    },
    {
      flightNumber: "AI202",
      origin: "Mumbai",
      destination: "Bengaluru",
      departureTime: new Date(now.getTime() + 48 * 60 * 60 * 1000),
      arrivalTime: new Date(now.getTime() + 50 * 60 * 60 * 1000),
    },
    {
      flightNumber: "AI303",
      origin: "Chennai",
      destination: "Hyderabad",
      departureTime: new Date(now.getTime() + 72 * 60 * 60 * 1000),
      arrivalTime: new Date(now.getTime() + 73.5 * 60 * 60 * 1000),
    },
    {
      flightNumber: "AI404",
      origin: "Kolkata",
      destination: "Delhi",
      departureTime: new Date(now.getTime() + 96 * 60 * 60 * 1000),
      arrivalTime: new Date(now.getTime() + 98 * 60 * 60 * 1000),
    },
    {
      flightNumber: "AI505",
      origin: "Pune",
      destination: "Ahmedabad",
      departureTime: new Date(now.getTime() + 120 * 60 * 60 * 1000),
      arrivalTime: new Date(now.getTime() + 121.5 * 60 * 60 * 1000),
    },
  ];

  await prisma.flight.createMany({ data: flightData });
  const flights = await prisma.flight.findMany({ orderBy: { id: 'asc' } });

  console.log(`✅ Created ${flights.length} flights`);
  return flights;
}

const PRICING_MATRIX = {
  WINDOW: 5000, // Seats A, F
  AISLE: 4000,  // Seats C, D
  MIDDLE: 3000, // Seats B, E
};

function calculateSeatPrice(columnLetter: string): number {
  if (['A', 'F'].includes(columnLetter)) return PRICING_MATRIX.WINDOW;
  if (['C', 'D'].includes(columnLetter)) return PRICING_MATRIX.AISLE;
  return PRICING_MATRIX.MIDDLE;
}

async function seedSeats(flights: Flight[]): Promise<Seat[]> {
  const seatLetters = ["A", "B", "C", "D", "E", "F"];
  const seatsData: Prisma.SeatCreateManyInput[] = [];

  for (const flight of flights) {
    for (let row = 1; row <= 20; row++) {
      for (const letter of seatLetters) {
        seatsData.push({
          flightId: flight.id,
          seatNumber: `${row}${letter}`,
          price: calculateSeatPrice(letter),
          status: SeatStatus.AVAILABLE,
        });
      }
    }
  }

  await prisma.seat.createMany({
    data: seatsData,
  });

  const seats = await prisma.seat.findMany({ orderBy: { id: 'asc' } });
  console.log(`✅ Created ${seats.length} seats`);

  return seats;
}

async function seedBookings(
  users: User[],
  flights: Flight[],
  seats: Seat[]
): Promise<void> {
  const bookingsPerFlight = 10;
  const bookingsData: Prisma.BookingCreateManyInput[] = [];
  const bookedSeatIds: number[] = [];

  for (const flight of flights) {
    const flightSeats = seats
      .filter((seat) => seat.flightId === flight.id)
      .sort((a, b) => a.id - b.id);

    for (let i = 0; i < bookingsPerFlight; i++) {
      const user = users[(flight.id - 1) * bookingsPerFlight + i];

      if (!user) break;

      const seat = flightSeats[i];

      bookingsData.push({
        userId: user.id,
        flightId: flight.id,
        seatId: seat.id,
        status: BookingStatus.CONFIRMED,
      });

      bookedSeatIds.push(seat.id);
      seat.status = SeatStatus.BOOKED;
    }
  }

  await prisma.booking.createMany({ data: bookingsData });
  await prisma.seat.updateMany({
    where: { id: { in: bookedSeatIds } },
    data: { status: SeatStatus.BOOKED },
  });

  console.log("✅ Created bookings");
}

async function seedWaitlist(
  users: User[],
  flights: Flight[]
): Promise<void> {
  const bookings = await prisma.booking.findMany({
    select: {
      userId: true,
    },
  });

  const bookedUserIds = new Set(bookings.map((b) => b.userId));

  let flightIndex = 0;
  const waitlistData: Prisma.WaitlistCreateManyInput[] = [];

  for (const user of users) {
    if (bookedUserIds.has(user.id)) continue;

    waitlistData.push({
      userId: user.id,
      flightId: flights[flightIndex].id,
      clvScore: user.clvScore,
    });

    flightIndex = (flightIndex + 1) % flights.length;
  }

  await prisma.waitlist.createMany({ data: waitlistData });

  console.log("✅ Created waitlist entries");
}


async function main() {
  console.log("🧹 Clearing existing data...");

  await prisma.$transaction([
    prisma.waitlist.deleteMany(),
    prisma.booking.deleteMany(),
    prisma.seat.deleteMany(),
    prisma.flight.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  const users = await seedUsers();
  const flights = await seedFlights();
  const seats = await seedSeats(flights);

  await seedBookings(users, flights, seats);
  await seedWaitlist(users, flights);

  console.log("🎉 Database seeded successfully!");
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });