import {
  PrismaClient,
  User,
  Flight,
  Seat,
  Booking,
  Waitlist,
  SeatStatus,
  BookingStatus,
} from "@prisma/client";

const prisma = new PrismaClient();


async function seedUsers(): Promise<User[]> {
  const users: User[] = [];

  for (let i = 1; i <= 100; i++) {
    const user = await prisma.user.create({
      data: {
        name: `User ${i}`,
        email: `user${i}@aerolock.dev`,
        clvScore: Math.floor(Math.random() * 1000) + 1,
      },
    });

    users.push(user);
  }

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

  const flights: Flight[] = [];

  for (const flight of flightData) {
    const createdFlight = await prisma.flight.create({
      data: flight,
    });

    flights.push(createdFlight);
  }

  console.log(`✅ Created ${flights.length} flights`);

  return flights;
}

async function seedSeats(flights: Flight[]): Promise<Seat[]> {
  const seats: Seat[] = [];

  const seatLetters = ["A", "B", "C", "D", "E", "F"];

  for (const flight of flights) {
    for (let row = 1; row <= 20; row++) {
      for (const letter of seatLetters) {
        const seat = await prisma.seat.create({
          data: {
            flightId: flight.id,
            seatNumber: `${row}${letter}`,
            status: SeatStatus.AVAILABLE,
          },
        });

        seats.push(seat);
      }
    }
  }

  console.log(`✅ Created ${seats.length} seats`);

  return seats;
}

async function seedBookings(
  users: User[],
  flights: Flight[],
  seats: Seat[]
): Promise<void> {
  const bookingsPerFlight = 10;

  for (const flight of flights) {
    const flightSeats = seats
      .filter((seat) => seat.flightId === flight.id)
      .sort((a, b) => a.id - b.id);

    for (let i = 0; i < bookingsPerFlight; i++) {
      const user = users[(flight.id - 1) * bookingsPerFlight + i];

      if (!user) break;

      const seat = flightSeats[i];

      await prisma.booking.create({
        data: {
          userId: user.id,
          flightId: flight.id,
          seatId: seat.id,
          status: BookingStatus.CONFIRMED,
        },
      });

      await prisma.seat.update({
        where: {
          id: seat.id,
        },
        data: {
          status: SeatStatus.BOOKED,
        },
      });

      // Keep the in-memory copy in sync
      seat.status = SeatStatus.BOOKED;
    }
  }

  console.log("✅ Created bookings");
}

async function seedWaitlist(
  users: User[],
  flights: Flight[]
): Promise<void> {
  // Find users that already have bookings
  const bookings = await prisma.booking.findMany({
    select: {
      userId: true,
    },
  });

  const bookedUserIds = new Set(bookings.map((b) => b.userId));

  let flightIndex = 0;

  for (const user of users) {
    if (bookedUserIds.has(user.id)) continue;

    await prisma.waitlist.create({
      data: {
        userId: user.id,
        flightId: flights[flightIndex].id,
        clvScore: user.clvScore,
      },
    });

    // Distribute waitlist entries across flights
    flightIndex = (flightIndex + 1) % flights.length;
  }

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