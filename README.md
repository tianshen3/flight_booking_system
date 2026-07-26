# AeroLock Server

AeroLock is a NestJS-based backend for a high-concurrency flight seat booking system. The service combines PostgreSQL persistence, Redis-backed seat locks, JWT authentication, role-based access control, and an intelligent waitlist flow for customers who miss out on initial availability.

## Overview

This project is structured as a modular monolith with clear domain-based modules for:

- Authentication and authorization
- Flights and seat management
- Booking lifecycle and Redis-based seat locking
- Waitlist handling
- Health monitoring
- Prisma-based persistence

## Tech Stack

- Node.js + TypeScript
- NestJS
- Prisma ORM
- PostgreSQL
- Redis
- Docker Compose
- JWT + Passport
- Swagger/OpenAPI

## Project Structure

```text
src/
  app.module.ts
  main.ts
  auth/                # auth, JWT, RBAC, admin bootstrap
  bookings/            # booking lock/confirm/cancel flows
  flights/             # flights, seats, and admin operations
  users/               # user domain and profile operations
  waitlist/            # waitlist join/leave and prioritization logic
  common/              # shared filters, health checks, utilities
  infrastructure/      # Prisma and Redis integration
```

## Features

### Core capabilities

- User registration and login
- JWT-based authenticated access
- Role-based access for admins and customers
- Flight creation, update, deletion, and retrieval
- Seat retrieval and admin seat status updates
- Booking lock, confirmation, cancellation, and lookup
- Redis-backed temporary seat locking to prevent double-booking
- Automatic expiration and cleanup of stale booking locks
- Health checks for database and Redis
- Swagger API documentation at `/api/docs`

### Current status

The booking engine is implemented and working, while the waitlist engine is present but still being finalized for deeper integration and validation.

## Prerequisites

Make sure you have the following installed:

- Node.js 18+
- Docker Desktop (for PostgreSQL and Redis)
- npm

## Environment Configuration

Create a `.env` file in the project root based on `.env.example`:

```env
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/aerolock?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379

DB_NAME=aerolock
DB_USER=postgres
DB_PASSWORD=postgres
DB_PORT=5432

ACCESS_TOKEN_SECRET=your-secret-key
BOOTSTRAP_ADMIN=true
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=supersecret123
ADMIN_NAME=System Admin
```

## Running the Project

### 1. Start infrastructure services

```bash
docker compose up -d postgres redis adminer
```

### 2. Install dependencies

```bash
npm install
```

### 3. Generate Prisma client and run migrations

```bash
npx prisma generate
npx prisma migrate dev
```

### 4. Seed the database (optional)

```bash
npm run prisma:seed
```

### 5. Start the application

Development:

```bash
npm run start:dev
```

Production build:

```bash
npm run build
npm run start:prod
```

## API Endpoints

The application runs under the `/api` prefix.

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`

### Flights

- `GET /api/flights`
- `GET /api/flights/:id`
- `POST /api/flights` (admin)
- `PATCH /api/flights/:id` (admin)
- `DELETE /api/flights/:id` (admin)

### Seats

- `GET /api/seats/:seatId`
- `PATCH /api/seats/:seatId` (admin)

### Bookings

- `POST /api/bookings/locks`
- `POST /api/bookings/confirm`
- `POST /api/bookings/cancel`
- `GET /api/bookings/me`
- `GET /api/bookings/:id`

### Waitlist

- `POST /api/waitlist`
- `DELETE /api/waitlist/:id`
- `GET /api/waitlist/flights/:flightId`

### Health

- `GET /api/health`

## Swagger Documentation

API documentation is available at:

```text
http://localhost:3000/api/docs
```

## Useful Commands

```bash
npm run build
npm run test
npm run lint
npm run prisma:studio
```

## Notes

- The service uses Redis for short-lived seat locks and cleanup jobs.
- Admin users can be auto-created when `BOOTSTRAP_ADMIN=true` and the required admin environment values are present.
- The project is designed to be extended with additional notification channels, payment integration, and production hardening in future iterations.


