# AeroLock

AeroLock is a high-concurrency backend engine for flight seat reservations built with NestJS, PostgreSQL, Prisma ORM, and Redis. It prevents double-booking under extreme concurrent load by using atomic Redis seat locks with automatic TTL expiration, manages temporary reservation holds, and prioritizes waitlisted passengers using a Customer Lifetime Value (CLV) priority queue.

---

## Problem Statement

High-concurrency reservation systems face critical data integrity and transaction throughput challenges during high-volume booking events:

* **Race Conditions & Double-Booking:** When multiple clients attempt to reserve the same seat concurrently, standard database read-then-write patterns introduce race conditions. Unprotected concurrent writes allow overlapping transactions to confirm the same seat ID, resulting in double-booking errors.
* **Database Lock Contention:** Relying on relational database row locks (`SELECT ... FOR UPDATE`) under high concurrent traffic leads to transaction contention, query timeouts, and database connection pool exhaustion.
* **Temporary Seat Locking & TTL Expiration:** Passengers require a temporary reservation window (5 minutes) to complete checkout. Holding inventory indefinitely blocks seat availability, while failing to release unpaid holds promptly leads to stale inventory lockouts. The backend must enforce deterministic Time-To-Live (TTL) mechanisms for temporary seat locks.
* **Waitlist Prioritization:** Standard First-In, First-Out (FIFO) queues treat all waitlisted passengers equally, ignoring customer tier status and business value. Reassigning canceled or expired seats requires a deterministic prioritization engine capable of evaluating Customer Lifetime Value (CLV) alongside timestamp offsets.

---

## Key Features

### ⚡ Redis-Based Seat Locking
* **What it does:** Uses atomic Redis string locks (`SET seat:{flightId}:{seatId} "{userId}" EX 300 NX`) with a 5-minute (300s) TTL to temporarily reserve seats during checkout.
* **Why it exists:** Offloads concurrency control from PostgreSQL to in-memory execution, eliminating database row lock contention and preventing double-booking during simultaneous reservation attempts.

### 🏆 CLV-Driven Waitlist Prioritization
* **What it does:** Queues waitlisted passengers using Redis Sorted Sets (`ZADD waitlist:{flightId} {clvScore} {userId}`), ranking passengers primarily by Customer Lifetime Value (CLV) score.
* **Why it exists:** Ensures high-value passengers receive priority seat reallocation whenever inventory expires or bookings are canceled, replacing unprioritized FIFO queues.

### 🔄 Automated Inventory Cleanup & Reassignment
* **What it does:** Runs periodic background cron tasks (`@nestjs/schedule`) every minute to query for expired locked bookings, clear stale Redis locks, mark bookings as `EXPIRED`, and trigger automatic waitlist promotion.
* **Why it exists:** Reclaims unpaid seat holds and reallocates inventory automatically without requiring manual administrator intervention or client-side polling.

### 🔐 Stateless Authentication & Role-Based Access Control
* **What it does:** Issues signed JSON Web Tokens (JWT) upon login (`POST /auth/login`) and enforces access restrictions using NestJS guards (`JwtAuthGuard`, `RolesGuard`) and `@Roles()` metadata decorators (`ADMIN` vs `CUSTOMER`).
* **Why it exists:** Secures administrative endpoints (such as flight management and admin lock overrides) while keeping passenger request authentication stateless.

### 📊 System Health & Administrative Analytics
* **What it does:** Provides active monitoring via `/health` checking PostgreSQL and Redis connectivity, alongside system-wide analytics via `GET /admin/stats`.
* **Why it exists:** Gives operators real-time insight into database health, Redis responsiveness, user counts, booking status distributions, and waitlist volume.

---

## Technology Stack

| Technology | Purpose |
| --- | --- |
| **NestJS** | Modular Monolith Backend Framework |
| **TypeScript** | Type-safe Application Logic |
| **PostgreSQL 16** | Persistent Relational Data Store |
| **Redis 7 (ioredis)** | In-Memory Concurrency Locks & Priority Queues |
| **Prisma ORM** | Schema Migrations, Type Generation & Database Access |
| **Passport JWT** | Stateless Authentication & Role-Based Access Control |
| **@nestjs/schedule** | Cron Task Scheduling for Inventory Cleanup |
| **Swagger / OpenAPI** | Interactive API Documentation |
| **Docker Compose** | Local Infrastructure Management (PostgreSQL + Redis) |

---

## System Architecture

![System Architecture](docs/diagrams/system-architecture.svg)

AeroLock is designed as a modular backend monolith where distinct business capabilities—such as authentication, flight scheduling, seat reservations, waitlist management, and admin stats—are encapsulated into independent NestJS domain modules. The service layer orchestrates dual-persistence operations, directing short-lived concurrency locks to Redis and permanent transactional state to PostgreSQL via Prisma ORM.

### Architecture Overview
1. **Client & API Layer:** Web/Mobile apps, Swagger UI (`/api/docs`), and Admin portals communicate over REST APIs protected by JWT authentication.
2. **NestJS Modular Monolith Core:**
   - `AuthModule`: Handles user registration, bcrypt password hashing, and JWT token issuance.
   - `UsersModule`: Manages user profiles, role assignments (`ADMIN` / `CUSTOMER`), and CLV scores.
   - `FlightsModule`: Manages flight catalog routes, schedules, and seat inventory (`AVAILABLE`, `LOCKED`, `BOOKED`).
   - `BookingModule`: Executes atomic Redis locks, manages booking states (`LOCKED`, `CONFIRMED`, `CANCELLED`, `EXPIRED`), and runs background cleanup crons.
   - `WaitlistModule`: Manages Redis Sorted Set waitlists scored by `clvScore` and performs automated seat promotion upon cancellation or lock expiration.
   - `AdminModule`: Exposes system-wide stats (`GET /admin/stats`) and admin booking overrides.
   - `HealthModule`: Provides `/health` checks verifying PostgreSQL database and Redis ping status.
3. **Data Infrastructure Layer:**
   - **Redis 7.x:** In-memory key-value store handling sub-millisecond seat locking (`seat:{flightId}:{seatId}`) and priority waitlist queues (`waitlist:{flightId}`).
   - **PostgreSQL 16.x:** Relational database persisting canonical records for `users`, `flights`, `seats`, `bookings`, and `waitlist`.

---

## Database Schema

![Database Schema](docs/diagrams/database-schema.svg)

The database schema models core flight reservation relationships through five primary entities and three domain enumerations:

### Domain Entities
* **`User` (`users`):** Stores user accounts, role (`ADMIN` / `CUSTOMER`), hashed credentials, and `clvScore` (Customer Lifetime Value).
* **`Flight` (`flights`):** Defines scheduled flights with `flightNumber`, `origin`, `destination`, `departureTime`, and `arrivalTime`.
* **`Seat` (`seats`):** Represents individual seats on a flight with `seatNumber`, `price`, and `status` (`AVAILABLE`, `LOCKED`, `BOOKED`). Includes a unique constraint on `(flightId, seatNumber)`.
* **`Booking` (`bookings`):** Transactional reservation records linking a `User`, `Flight`, and `Seat` with status (`LOCKED`, `CONFIRMED`, `CANCELLED`, `EXPIRED`).
* **`Waitlist` (`waitlist`):** Canonical backup table tracking passengers waiting for a flight, indexed by `clvScore`.

### Domain Enumerations
* **`Role`:** `ADMIN`, `CUSTOMER`
* **`SeatStatus`:** `AVAILABLE`, `LOCKED`, `BOOKED`
* **`BookingStatus`:** `LOCKED`, `CONFIRMED`, `CANCELLED`, `EXPIRED`

---

## Project Structure

```text
src/
├── admin/          # System statistics (GET /admin/stats) and admin booking overrides
├── auth/           # JWT strategies, login/register controllers, password hashing
├── bookings/       # Seat locking (SeatLockService), booking logic, cleanup cron jobs
├── common/         # Health controller (/health), global filters, guards, and decorators
├── config/         # Environment variable loaders and configuration schema
├── flights/        # Flight catalog management, route scheduling, seat inventory queries
├── infrastructure/ # Database providers for Prisma ORM and ioredis client
├── notifications/  # Event notification handlers for booking state & waitlist updates
├── users/          # User profile management, role claims, and CLV score tracking
└── waitlist/       # Priority waitlist engine utilizing Redis Sorted Sets (ZADD / ZREVRANGE)
```

---

## Booking Lifecycle

```text
 Client                NestJS Backend                 Redis 7                    PostgreSQL 16
   |                         |                           |                             |
   |--- 1. POST /locks ----->|                           |                             |
   |                         |--- 2. SET (EX 300 NX) --->|                             |
   |                         |<-- 3. Lock Acquired ------|                             |
   |                         |--------------------------------- 4. Create LOCKED ----->|
   |<-- 5. Booking Locked ---|                                                         |
   |                         |                                                         |
   |--- 6. POST /confirm --->|                                                         |
   |                         |--- 7. Check Lock Exist -->|                             |
   |                         |--------------------------------- 8. Update CONFIRMED -->|
   |<-- 9. Confirmed --------|                                                         |
```

1. **Reservation Lock Attempt:** The client submits a lock request (`POST /bookings/locks`) with `flightId` and `seatId`.
2. **Atomic Lock Acquisition:** The backend executes `SET seat:{flightId}:{seatId} "{userId}" EX 300 NX` in Redis. If the key already exists, Redis returns `null`, and the backend responds with a `409 Conflict` ("Seat is temporarily locked by another user").
3. **Pending Record Creation:** Upon acquiring the Redis lock, a booking record with `LOCKED` status is created in PostgreSQL and the seat status is updated to `LOCKED`.
4. **Confirmation & Persistence:** The client confirms payment (`POST /bookings/confirm`). On validation, the booking status transitions to `CONFIRMED` in PostgreSQL and the seat status transitions to `BOOKED`.
5. **Expiration & Inventory Release:** If payment is not completed within 5 minutes (300s), the background `@Cron(CronExpression.EVERY_MINUTE)` cleanup job identifies expired locked bookings, marks them as `EXPIRED`, sets the seat status to `AVAILABLE`, and triggers the waitlist reassignment engine.

---

## Waitlist Engine

When a flight is fully booked, passengers can join a priority waitlist managed in Redis Sorted Sets:

* **CLV Score Ranking:** Waitlisted passengers are added to Redis using `ZADD waitlist:{flightId} {clvScore} {userId}`.
* **Deterministic Priority:** The engine uses `ZREVRANGE waitlist:{flightId} 0 0` to retrieve the passenger with the highest Customer Lifetime Value (`clvScore`).
* **Automated Reassignment & Promotion:** When a seat hold is canceled or expires, `SeatReassignmentService` automatically pops the top waitlisted passenger, acquires a 5-minute Redis lock for them, creates a `LOCKED` booking, and dispatches a waitlist promotion notification.

---

## Key API Endpoints

### Authentication
* `POST /auth/register` - Register a new user account
* `POST /auth/login` - Authenticate credentials and receive a JWT Bearer token
* `GET /auth/profile` - Get authenticated user profile

### Flights & Seats
* `GET /flights` - List all scheduled flights
* `GET /flights/:id` - Get flight details by ID
* `POST /flights` - Create a new flight (*Admin only*)
* `GET /flights/:flightId/seats` - List all seats for a flight
* `GET /seats/:seatId` - Get seat details by ID
* `PATCH /seats/:seatId` - Update seat status (*Admin only*)

### Bookings & Seat Locks
* `POST /bookings/locks` - Acquire temporary 5-minute Redis seat lock & create LOCKED booking
* `POST /bookings/confirm` - Confirm a LOCKED booking into a CONFIRMED state
* `POST /bookings/cancel` - Cancel a booking, release seat lock, & trigger waitlist promotion
* `GET /bookings/me` - List bookings for current user
* `GET /bookings/admin` - Query all system bookings with optional filters (*Admin only*)
* `PATCH /bookings/admin/:id/cancel` - Admin force cancel booking (*Admin only*)

### Waitlist
* `POST /waitlist` - Join waitlist for a flight (ranked by CLV score)
* `DELETE /waitlist/:id` - Leave waitlist
* `GET /waitlist/flights/:flightId` - Get waitlist entries for a flight

### Admin & System Health
* `GET /admin/stats` - System statistics breakdown (*Admin only*)
* `GET /health` - Database & Redis connectivity status

---

## API Documentation

Interactive OpenAPI documentation is generated using NestJS Swagger annotations. When running the server locally, full endpoint contracts, DTO schema definitions, and JWT authentication testing are accessible via Swagger UI at:

`http://localhost:3000/api/docs`

---

## Running Locally

> **Note on Infrastructure:** Docker Compose is used exclusively to provision local PostgreSQL and Redis database instances. The NestJS backend application runs directly on Node.js.

### Prerequisites

* **Node.js** (v18+)
* **npm** (v9+)
* **Docker Desktop** (for local PostgreSQL and Redis containers)

### Setup & Run Instructions

```bash
# 1. Clone the repository
git clone https://github.com/tianshen3/AeroLock_Server.git
cd AeroLock_Server

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env

# 4. Start database infrastructure (PostgreSQL & Redis)
docker compose up -d

# 5. Generate Prisma client, run migrations, and seed initial data
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# 6. Start NestJS development server
npm run start:dev
```

The application server listens on `http://localhost:3000/api`. Interactive Swagger documentation is available at `http://localhost:3000/api/docs`.

---

## License

This project is licensed under the [MIT License](LICENSE).
