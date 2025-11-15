/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { AppointmentsRepository } from './appointments.repository';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { QueryAppointmentDto } from './dto/query-appointment.dto';
import {
  Appointment,
  validateAppointment,
  isValidStatusTransition,
  AppointmentStatus,
  canCancelAppointment,
} from '../../appointment';

@Injectable()
export class AppointmentsService implements OnModuleInit {
  private readonly logger = new Logger(AppointmentsService.name);

  constructor(private readonly repository: AppointmentsRepository) {}

  async onModuleInit() {
    try {
      await this.repository.seed();
      this.logger.log('Service initialized successfully');
    } catch (error) {
      this.logger.warn(
        'Failed to seed database, continuing without seed data',
        error,
      );
    }
  }

  async findAll(queryDto: QueryAppointmentDto): Promise<{
    data: Appointment[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  }> {
    try {
      const result = await this.repository.findAll({
        status: queryDto.status,
        page: queryDto.page || 1,
        pageSize: queryDto.pageSize || 20,
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to retrieve appointments', error);
      throw new InternalServerErrorException('Failed to retrieve appointments');
    }
  }

  async findOne(id: string): Promise<Appointment> {
    try {
      const appointment = await this.repository.findById(id);

      if (!appointment) {
        throw new NotFoundException(`Appointment with ID ${id} not found`);
      }

      return appointment;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to retrieve appointment ${id}`, error);
      throw new InternalServerErrorException(
        `Failed to retrieve appointment ${id}`,
      );
    }
  }

  async create(createDto: CreateAppointmentDto): Promise<Appointment> {
    try {
      const appointment: Omit<Appointment, 'id' | 'meta'> = {
        resourceType: 'Appointment',
        identifier: createDto.identifier,
        status: createDto.status,
        cancellationReason: createDto.cancellationReason,
        serviceCategory: createDto.serviceCategory,
        serviceType: createDto.serviceType,
        specialty: createDto.specialty,
        appointmentType: createDto.appointmentType,
        reasonCode: createDto.reasonCode,
        reasonReference: createDto.reasonReference,
        priority: createDto.priority,
        description: createDto.description,
        supportingInformation: createDto.supportingInformation,
        start: createDto.start,
        end: createDto.end,
        minutesDuration: createDto.minutesDuration,
        slot: createDto.slot,
        created: createDto.created,
        comment: createDto.comment,
        patientInstruction: createDto.patientInstruction,
        basedOn: createDto.basedOn,
        participant: createDto.participant.map((p) => ({
          type: p.type,
          actor: p.actor as any,
          required: p.required,
          status: p.status,
          period: p.period,
        })),
        requestedPeriod: createDto.requestedPeriod,
      };

      const validation = validateAppointment(appointment as Appointment);
      if (!validation.isValid) {
        throw new BadRequestException({
          message: 'Appointment validation failed',
          errors: validation.errors,
        });
      }

      if (appointment.start && appointment.end) {
        const start = new Date(appointment.start);
        const end = new Date(appointment.end);
        if (start >= end) {
          throw new BadRequestException(
            'Appointment start time must be before end time',
          );
        }
      }

      const created = await this.repository.create(appointment);

      this.logger.log(
        `Successfully created appointment with ID: ${created.id}`,
      );
      return created;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Failed to create appointment', error);
      throw new InternalServerErrorException('Failed to create appointment');
    }
  }

  async updateStatus(
    id: string,
    newStatus: AppointmentStatus,
  ): Promise<Appointment> {
    try {
      const existing = await this.repository.findById(id);
      if (!existing) {
        throw new NotFoundException(`Appointment with ID ${id} not found`);
      }

      if (!isValidStatusTransition(existing.status, newStatus)) {
        throw new BadRequestException(
          `Invalid status transition from ${existing.status} to ${newStatus}`,
        );
      }

      const updated = await this.repository.update(id, { status: newStatus });
      if (!updated) {
        throw new NotFoundException(`Appointment with ID ${id} not found`);
      }

      return updated;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`Failed to update appointment ${id} status`, error);
      throw new InternalServerErrorException(
        `Failed to update appointment status`,
      );
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const existing = await this.repository.findById(id);
      if (!existing) {
        throw new NotFoundException(`Appointment with ID ${id} not found`);
      }

      if (!canCancelAppointment(existing.status)) {
        throw new BadRequestException(
          `Cannot cancel appointment with status ${existing.status}`,
        );
      }

      await this.updateStatus(id, AppointmentStatus.CANCELLED);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`Failed to remove appointment ${id}`, error);
      throw new InternalServerErrorException(`Failed to remove appointment`);
    }
  }
}
