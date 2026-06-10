# Boki — Book Marketplace

A full-featured book marketplace where users can buy and sell books, with OAuth authentication, phone verification, and a modern web frontend.

## Tech Stack

| Layer     | Technology              |
|-----------|------------------------|
| Backend   | Java 22, Spring Boot 3 |
| Frontend  | Next.js (App Router)   |
| Database  | PostgreSQL (Supabase)  |
| Auth/OTP  | Firebase Authentication|
| Email     | SendGrid               |

## Architecture

The backend follows **Clean Architecture + Hexagonal (Ports & Adapters)**:

- **Domain**: Entities, Value Objects, Ports (interfaces)
- **Application**: Use Cases, DTOs, Mappers
- **Infrastructure**: JPA, Security, Firebase, Email adapters
- **Interface**: REST Controllers

See [`docs/CONSTRAINTS.md`](docs/CONSTRAINTS.md) for full engineering constraints.

## Prerequisites

- JDK 22+
- Node.js 20+
- Maven 3.9+
- Supabase account (for PostgreSQL)

## Quick Start

### 1. Clone and configure

```bash
git clone <repo-url>
cd boki
cp .env.example .env
# Edit .env with your Supabase DB credentials and other secrets
```

### 2. Start backend

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### 3. Start frontend

```bash
cd web
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

## Project Structure

```
boki/
├── backend/        # Spring Boot API
├── web/            # Next.js frontend
├── mobile/         # React Native (future)
├── database/       # SQL migrations
└── docs/           # Architecture documentation
```

## Database

This project uses **Supabase** as the PostgreSQL provider. Flyway migrations are applied automatically on backend startup.

Get your connection details from: **Supabase Dashboard → Settings → Database**

## Git Workflow

- **main** → production-ready
- **develop** → integration
- **feature/*** → new features
- **fix/*** → bug fixes

See [`docs/CONSTRAINTS.md`](docs/CONSTRAINTS.md) for commit conventions.

## License

Private — All rights reserved.
