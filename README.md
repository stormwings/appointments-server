# FHIR R4 Appointments API

A production-ready RESTful API for managing healthcare appointments using the FHIR R4 (Fast Healthcare Interoperability Resources) standard.

## Description

This NestJS application provides a comprehensive implementation of FHIR R4 Appointment resources with full CRUD operations, validation, and persistence using SQLite. The API is designed to be FHIR-compliant and follows healthcare industry standards for appointment management.

## Features

- **FHIR R4 Compliant**: Full implementation of FHIR R4 Appointment resource specification
- **RESTful API**: Standard HTTP methods (GET, POST, PATCH, DELETE) for appointment management
- **Validation**: Automatic request/response validation using class-validator and FHIR rules
- **Database Persistence**: SQLite database with Sequelize ORM for reliable data storage
- **Type Safety**: Full TypeScript implementation with comprehensive type definitions
- **Business Rules**: Enforced FHIR status transitions and appointment constraints
- **Seeded Data**: Automatic database seeding with sample appointments for testing
- **Docker Ready**: Production-ready Docker and Docker Compose configurations

## API Endpoints

The API provides five main endpoints:

1. **GET /appointments** - Search and filter appointments with pagination
2. **GET /appointments/:id** - Retrieve a specific appointment by ID
3. **POST /appointments** - Create a new appointment with validation
4. **PATCH /appointments/:id/status** - Update appointment status
5. **DELETE /appointments/:id** - Cancel an appointment (soft delete)

See [API.md](./API.md) for detailed endpoint documentation and examples.

## Quick Start

### Option 1: Docker (Recommended for Production)

The easiest way to run the application:

```bash
# Build and start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

The API will be available at `http://localhost:8000`.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete Docker deployment documentation.

### Option 2: Local Development

#### Installation

```bash
npm install
```

#### Running the Application

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run start:prod

# Standard development
npm run start
```

The API will be available at `http://localhost:8000` (or the port specified in the `PORT` environment variable).

### Testing the API

Once the application is running, you can test it with curl:

```bash
# Get all appointments
curl http://localhost:8000/appointments

# Get a specific appointment
curl http://localhost:8000/appointments/{appointment-id}

# Create a new appointment
curl -X POST http://localhost:8000/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "status": "booked",
    "description": "Annual checkup",
    "start": "2025-12-01T10:00:00Z",
    "end": "2025-12-01T10:30:00Z",
    "participant": [{
      "actor": {
        "reference": "Patient/patient-123",
        "type": "Patient",
        "display": "John Doe"
      },
      "status": "accepted"
    }]
  }'
```

## Project Structure

```
appointments/
├── src/
│   ├── appointments/          # Appointments module
│   │   ├── dto/              # Data Transfer Objects for validation
│   │   ├── appointments.controller.ts  # REST API endpoints
│   │   ├── appointments.service.ts     # Business logic layer
│   │   ├── appointments.repository.ts  # Data access layer
│   │   └── appointments.module.ts      # Module definition
│   ├── database/             # Database configuration
│   │   ├── models/           # Sequelize database models
│   │   ├── database.config.ts
│   │   ├── database.module.ts
│   │   └── database.providers.ts
│   ├── app.module.ts         # Root application module
│   └── main.ts               # Application entry point
├── test/                     # End-to-end tests
├── appointment.ts            # FHIR R4 type definitions and utilities
├── data/                     # SQLite database storage
├── Dockerfile                # Docker image configuration
├── docker-compose.yml        # Docker Compose orchestration
├── .dockerignore             # Docker ignore rules
├── API.md                    # Detailed API documentation
├── DEPLOYMENT.md             # Docker deployment guide
├── CLAUDE.md                 # Development guidelines
└── README.md                 # This file
```

## Development Commands

```bash
# Format code
npm run format

# Lint and auto-fix
npm run lint

# Build for production
npm run build

# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run end-to-end tests
npm run test:e2e
```

## FHIR R4 Compliance

This implementation follows the FHIR R4 specification for Appointment resources. Key features include:

- Required fields: `resourceType`, `status`, `participant` (with at least one Patient)
- Status lifecycle management with valid state transitions
- Participant tracking with acceptance statuses
- Time-based appointment scheduling with validation
- Support for all optional FHIR Appointment fields

For complete FHIR R4 specification details, see: https://hl7.org/fhir/R4/appointment.html

## Database

The application uses SQLite for data persistence with the following schema:

- **appointments** table: Stores main appointment data
- **participants** table: Stores appointment participants with foreign key relationship

The database file is stored in `./data/appointments.sqlite` and is automatically created on first run.

## Technologies Used

- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript
- **Sequelize** - ORM for database operations
- **SQLite** - Lightweight relational database
- **class-validator** - DTO validation
- **class-transformer** - Object transformation
- **Docker** - Containerization and deployment

## License

MIT
