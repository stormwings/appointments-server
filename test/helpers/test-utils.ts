import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Appointment } from '../../appointment';

/**
 * Utility functions for e2e tests
 * Provides common operations to reduce code duplication
 */
export class TestUtils {
  /**
   * Create an appointment and return the created resource
   */
  static async createAppointment(
    app: INestApplication,
    appointmentData: any,
  ): Promise<Appointment> {
    const response = await request(app.getHttpServer())
      .post('/appointments')
      .send(appointmentData)
      .expect(201);

    return response.body;
  }

  /**
   * Create an appointment and expect it to fail with specific status code
   */
  static async createAppointmentExpectFailure(
    app: INestApplication,
    appointmentData: any,
    expectedStatusCode: number = 400,
  ): Promise<any> {
    const response = await request(app.getHttpServer())
      .post('/appointments')
      .send(appointmentData)
      .expect(expectedStatusCode);

    return response.body;
  }

  /**
   * Retrieve appointment by ID
   */
  static async getAppointment(
    app: INestApplication,
    id: string,
  ): Promise<Appointment> {
    const response = await request(app.getHttpServer())
      .get(`/appointments/${id}`)
      .expect(200);

    return response.body;
  }

  /**
   * Retrieve appointment by ID and expect failure
   */
  static async getAppointmentExpectFailure(
    app: INestApplication,
    id: string,
    expectedStatusCode: number = 404,
  ): Promise<any> {
    const response = await request(app.getHttpServer())
      .get(`/appointments/${id}`)
      .expect(expectedStatusCode);

    return response.body;
  }

  /**
   * Search appointments with query parameters
   */
  static async searchAppointments(
    app: INestApplication,
    queryParams: Record<string, string>,
  ): Promise<Appointment[]> {
    const queryString = new URLSearchParams(queryParams).toString();
    const response = await request(app.getHttpServer())
      .get(`/appointments?${queryString}`)
      .expect(200);

    // Extract the data array from the paginated response
    return response.body.data || response.body;
  }

  /**
   * Search appointments and expect failure
   */
  static async searchAppointmentsExpectFailure(
    app: INestApplication,
    queryParams: Record<string, string>,
    expectedStatusCode: number = 400,
  ): Promise<any> {
    const queryString = new URLSearchParams(queryParams).toString();
    const response = await request(app.getHttpServer())
      .get(`/appointments?${queryString}`)
      .expect(expectedStatusCode);

    return response.body;
  }

  /**
   * Assert appointment has required FHIR fields
   */
  static assertValidFhirAppointment(appointment: any): void {
    expect(appointment).toBeDefined();
    expect(appointment.resourceType).toBe('Appointment');
    expect(appointment.id).toBeDefined();
    expect(appointment.status).toBeDefined();
    expect(appointment.participant).toBeDefined();
    expect(Array.isArray(appointment.participant)).toBe(true);
    expect(appointment.participant.length).toBeGreaterThan(0);
    expect(appointment.meta).toBeDefined();
    expect(appointment.meta.versionId).toBeDefined();
    expect(appointment.meta.lastUpdated).toBeDefined();
  }

  /**
   * Assert appointment has a patient participant
   */
  static assertHasPatientParticipant(appointment: Appointment): void {
    const hasPatient = appointment.participant.some(
      (p) => p.actor?.type === 'Patient',
    );
    expect(hasPatient).toBe(true);
  }

  /**
   * Find participant by type in appointment
   */
  static findParticipantByType(
    appointment: Appointment,
    type: string,
  ): any | undefined {
    return appointment.participant.find((p) => p.actor?.type === type);
  }

  /**
   * Count participants by type
   */
  static countParticipantsByType(
    appointment: Appointment,
    type: string,
  ): number {
    return appointment.participant.filter((p) => p.actor?.type === type).length;
  }

  /**
   * Generate unique test identifier
   */
  static generateTestId(prefix: string = 'test'): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Create multiple appointments in parallel
   */
  static async createMultipleAppointments(
    app: INestApplication,
    appointmentDataArray: any[],
  ): Promise<Appointment[]> {
    const promises = appointmentDataArray.map((data) =>
      this.createAppointment(app, data),
    );
    return await Promise.all(promises);
  }

  /**
   * Wait for specified milliseconds (for timing-sensitive tests)
   */
  static async wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Assert error response structure
   */
  static assertErrorResponse(response: any, expectedStatusCode: number): void {
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(expectedStatusCode);
    expect(response.message).toBeDefined();
  }

  /**
   * Assert validation error response
   */
  static assertValidationErrorResponse(response: any): void {
    this.assertErrorResponse(response, 400);
    // Could have single message string or array of messages
    expect(
      typeof response.message === 'string' || Array.isArray(response.message),
    ).toBe(true);
  }
}
