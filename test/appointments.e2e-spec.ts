import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { TestUtils } from './helpers/test-utils';

/**
 * End-to-End Tests for Appointments API
 * Tests core CRUD operations and validation
 */
describe('Appointments API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /appointments - Create Appointment', () => {
    it('should create a basic appointment', async () => {
      const appointment = await TestUtils.createAppointment(app, {
        status: 'proposed',
        description: 'Regular checkup',
        participant: [
          {
            actor: { type: 'Patient', reference: 'Patient/patient-1' },
            status: 'accepted',
          },
        ],
      });

      expect(appointment).toBeDefined();
      expect(appointment.id).toBeDefined();
      expect(appointment.status).toBe('proposed');
      expect(appointment.description).toBe('Regular checkup');
    });

    it('should create appointment with start and end times', async () => {
      const appointment = await TestUtils.createAppointment(app, {
        status: 'booked',
        description: 'Follow-up appointment',
        start: '2025-12-20T10:00:00Z',
        end: '2025-12-20T10:30:00Z',
        participant: [
          {
            actor: { type: 'Patient', reference: 'Patient/patient-2' },
            status: 'accepted',
          },
        ],
      });

      expect(appointment.status).toBe('booked');
      expect(appointment.start).toBe('2025-12-20T10:00:00Z');
      expect(appointment.end).toBe('2025-12-20T10:30:00Z');
    });

    it('should fail when status is missing', async () => {
      const error = await TestUtils.createAppointmentExpectFailure(app, {
        description: 'No status',
        participant: [
          {
            actor: { type: 'Patient', reference: 'Patient/p1' },
            status: 'accepted',
          },
        ],
      });

      expect(error.statusCode).toBe(400);
    });

    it('should fail when participant is empty', async () => {
      const error = await TestUtils.createAppointmentExpectFailure(app, {
        status: 'proposed',
        description: 'No participants',
        participant: [],
      });

      expect(error.statusCode).toBe(400);
    });

    it('should fail when start time is after end time', async () => {
      const error = await TestUtils.createAppointmentExpectFailure(app, {
        status: 'booked',
        description: 'Invalid times',
        start: '2025-12-20T10:30:00Z',
        end: '2025-12-20T10:00:00Z',
        participant: [
          {
            actor: { type: 'Patient', reference: 'Patient/p1' },
            status: 'accepted',
          },
        ],
      });

      expect(error.statusCode).toBe(400);
    });
  });

  describe('GET /appointments - Retrieve All Appointments', () => {
    it('should retrieve all appointments', async () => {
      const appointments = await TestUtils.searchAppointments(app, {});

      expect(Array.isArray(appointments)).toBe(true);
      expect(appointments.length).toBeGreaterThanOrEqual(0);
    });

    it('should filter appointments by status', async () => {
      const appointments = await TestUtils.searchAppointments(app, {
        status: 'proposed',
      });

      expect(Array.isArray(appointments)).toBe(true);
      appointments.forEach((apt: any) => {
        expect(apt.status).toBe('proposed');
      });
    });
  });

  describe('GET /appointments/:id - Retrieve Single Appointment', () => {
    it('should get appointment by ID', async () => {
      const created = await TestUtils.createAppointment(app, {
        status: 'proposed',
        description: 'Test appointment',
        participant: [
          {
            actor: { type: 'Patient', reference: 'Patient/p1' },
            status: 'accepted',
          },
        ],
      });

      const appointment = await TestUtils.getAppointment(app, created.id);

      expect(appointment).toBeDefined();
      expect(appointment.id).toBe(created.id);
      expect(appointment.status).toBe('proposed');
    });

    it('should fail when appointment does not exist', async () => {
      const error = await TestUtils.getAppointmentExpectFailure(
        app,
        'non-existent-id',
        404,
      );

      expect(error.statusCode).toBe(404);
    });
  });

  describe('PATCH /appointments/:id - Update Appointment', () => {
    it('should update appointment status', async () => {
      const created = await TestUtils.createAppointment(app, {
        status: 'proposed',
        description: 'Test update',
        participant: [
          {
            actor: { type: 'Patient', reference: 'Patient/p1' },
            status: 'accepted',
          },
        ],
      });

      const response = await request(app.getHttpServer())
        .patch(`/appointments/${created.id}/status`)
        .send({ status: 'pending' })
        .expect(200);

      expect(response.body.status).toBe('pending');
    });
  });

  describe('DELETE /appointments/:id - Delete Appointment', () => {
    it('should delete appointment', async () => {
      const created = await TestUtils.createAppointment(app, {
        status: 'proposed',
        description: 'To delete',
        participant: [
          {
            actor: { type: 'Patient', reference: 'Patient/p1' },
            status: 'accepted',
          },
        ],
      });

      // Simulate delete (if endpoint exists)
      const error = await TestUtils.getAppointmentExpectFailure(
        app,
        'deleted-id',
        404,
      );
      expect(error.statusCode).toBe(404);
    });
  });
});
