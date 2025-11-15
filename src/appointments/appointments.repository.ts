/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  Inject,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { Sequelize } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import {
  Appointment,
  AppointmentStatus,
  ParticipantRequired,
  ParticipantStatus,
  AppointmentParticipant,
} from '../../appointment';
import { SEQUELIZE } from '../database/database.providers';
import { AppointmentModel } from '../database/models/appointment.model';
import { ParticipantModel } from '../database/models/participant.model';

@Injectable()
export class AppointmentsRepository {
  private readonly logger = new Logger(AppointmentsRepository.name);

  constructor(
    @Inject(SEQUELIZE)
    private sequelize: Sequelize,
  ) {}

  async findAll(filters?: {
    status?: AppointmentStatus;
    page?: number;
    pageSize?: number;
  }): Promise<{
    data: Appointment[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  }> {
    try {
      const page = filters?.page || 1;
      const pageSize = Math.min(filters?.pageSize || 20, 100);
      const offset = (page - 1) * pageSize;

      const whereClause: any = {};
      if (filters?.status) {
        whereClause.status = filters.status;
      }

      const { rows: appointmentModels, count: total } =
        await AppointmentModel.findAndCountAll({
          where: whereClause,
          include: [
            {
              model: ParticipantModel,
              as: 'participants',
            },
          ],
          order: [['createdAt', 'DESC']],
          limit: pageSize,
          offset: offset,
        });

      const results = appointmentModels.map((model) =>
        this.modelToAppointment(model),
      );

      const totalPages = Math.ceil(total / pageSize);

      return {
        data: results,
        page,
        pageSize,
        total,
        totalPages,
      };
    } catch (error) {
      this.logger.error('Failed to retrieve appointments from database', error);
      throw new InternalServerErrorException('Database query failed');
    }
  }

  async findById(id: string): Promise<Appointment | null> {
    try {
      this.logger.log(`Finding appointment by ID: ${id}`);

      const model = await AppointmentModel.findByPk(id, {
        include: [
          {
            model: ParticipantModel,
            as: 'participants',
          },
        ],
      });

      if (!model) {
        this.logger.log(`Appointment with ID ${id} not found`);
        return null;
      }

      const appointment = this.modelToAppointment(model);
      this.logger.log(`Successfully retrieved appointment ${id}`);
      return appointment;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve appointment ${id} from database`,
        error,
      );
      throw new InternalServerErrorException('Database query failed');
    }
  }

  async create(
    appointment: Omit<Appointment, 'id' | 'meta'>,
  ): Promise<Appointment> {
    const transaction = await this.sequelize.transaction();

    try {
      const id = uuidv4();
      const now = new Date().toISOString();

      this.logger.log(`Creating appointment with ID: ${id}`);

      const appointmentModel = await AppointmentModel.create(
        {
          id,
          resourceType: 'Appointment',
          status: appointment.status,
          meta: {
            versionId: '1',
            lastUpdated: now,
          },
          description: appointment.description,
          start: appointment.start,
          end: appointment.end,
          minutesDuration: appointment.minutesDuration,
          comment: appointment.comment,
        },
        { transaction },
      );

      const participantModels = await Promise.all(
        appointment.participant.map((participant) =>
          ParticipantModel.create(
            {
              appointmentId: id,
              actor: participant.actor,
              required: participant.required,
              status: participant.status,
            },
            { transaction },
          ),
        ),
      );

      await transaction.commit();
      this.logger.log(
        `Successfully created appointment ${id} with ${participantModels.length} participants`,
      );

      appointmentModel.participants = participantModels;
      return this.modelToAppointment(appointmentModel);
    } catch (error) {
      await transaction.rollback();
      this.logger.error(
        'Failed to create appointment, transaction rolled back',
        error,
      );
      throw new InternalServerErrorException(
        'Failed to create appointment in database',
      );
    }
  }

  async update(
    id: string,
    updates: Partial<Appointment>,
  ): Promise<Appointment | null> {
    const transaction = await this.sequelize.transaction();

    try {
      this.logger.log(`Updating appointment ${id}`);

      const existing = await AppointmentModel.findByPk(id, { transaction });
      if (!existing) {
        await transaction.rollback();
        this.logger.warn(`Appointment ${id} not found for update`);
        return null;
      }

      const updateData: any = { ...updates };
      delete updateData.id;
      delete updateData.resourceType;

      await AppointmentModel.update(updateData, {
        where: { id },
        transaction,
      });

      if (updates.participant) {
        await ParticipantModel.destroy({
          where: { appointmentId: id },
          transaction,
        });

        await Promise.all(
          updates.participant.map((participant) =>
            ParticipantModel.create(
              {
                appointmentId: id,
                actor: participant.actor,
                required: participant.required,
                status: participant.status,
              },
              { transaction },
            ),
          ),
        );
      }

      await transaction.commit();
      this.logger.log(`Successfully updated appointment ${id}`);

      const updatedModel = await AppointmentModel.findByPk(id, {
        include: [{ model: ParticipantModel, as: 'participants' }],
      });

      return this.modelToAppointment(updatedModel!);
    } catch (error) {
      await transaction.rollback();
      this.logger.error(
        `Failed to update appointment ${id}, transaction rolled back`,
        error,
      );
      throw new InternalServerErrorException(
        'Failed to update appointment in database',
      );
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      this.logger.log(`Deleting appointment ${id}`);

      const result = await AppointmentModel.destroy({
        where: { id },
      });

      const deleted = result > 0;
      if (deleted) {
        this.logger.log(`Successfully deleted appointment ${id}`);
      } else {
        this.logger.warn(`Appointment ${id} not found for deletion`);
      }

      return deleted;
    } catch (error) {
      this.logger.error(`Failed to delete appointment ${id}`, error);
      throw new InternalServerErrorException(
        'Failed to delete appointment from database',
      );
    }
  }

  async clear(): Promise<void> {
    try {
      this.logger.warn('Clearing all appointments from database');
      await AppointmentModel.destroy({ where: {} });
      this.logger.log('Successfully cleared all appointments');
    } catch (error) {
      this.logger.error('Failed to clear appointments', error);
      throw new InternalServerErrorException(
        'Failed to clear appointments from database',
      );
    }
  }

  async count(): Promise<number> {
    try {
      const count = await AppointmentModel.count();
      this.logger.log(`Total appointments in database: ${count}`);
      return count;
    } catch (error) {
      this.logger.error('Failed to count appointments', error);
      throw new InternalServerErrorException(
        'Failed to count appointments in database',
      );
    }
  }

  private modelToAppointment(model: AppointmentModel): Appointment {
    try {
      const participants: AppointmentParticipant[] =
        model.participants?.map((p) => ({
          actor: p.actor as any,
          required: p.required,
          status: p.status,
        })) || [];

      return {
        resourceType: 'Appointment',
        id: model.id,
        meta: model.meta,
        status: model.status,
        description: model.description,
        start: model.start,
        end: model.end,
        minutesDuration: model.minutesDuration,
        comment: model.comment,
        participant: participants,
      };
    } catch (error) {
      this.logger.error('Failed to convert model to appointment', error);
      throw new InternalServerErrorException(
        'Failed to convert database model to FHIR resource',
      );
    }
  }

  async seed(): Promise<void> {
    try {
      const existingCount = await this.count();
      if (existingCount > 0) {
        this.logger.log('Database already contains data, skipping seed');
        return;
      }

      this.logger.log('Seeding database with sample appointment');

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      await this.create({
        resourceType: 'Appointment',
        status: AppointmentStatus.BOOKED,
        description: 'Annual physical examination',
        start: tomorrow.toISOString(),
        end: new Date(tomorrow.getTime() + 30 * 60000).toISOString(),
        minutesDuration: 30,
        participant: [
          {
            actor: {
              reference: 'Patient/patient-123',
              type: 'Patient',
              display: 'John Doe',
            },
            required: ParticipantRequired.REQUIRED,
            status: ParticipantStatus.ACCEPTED,
          },
          {
            actor: {
              reference: 'Practitioner/practitioner-456',
              type: 'Practitioner',
              display: 'Dr. Jane Smith',
            },
            required: ParticipantRequired.REQUIRED,
            status: ParticipantStatus.ACCEPTED,
          },
        ],
      });

      this.logger.log('Successfully seeded database with sample appointment');
    } catch (error) {
      this.logger.error('Failed to seed database', error);
      throw new InternalServerErrorException(
        'Failed to seed database with sample data',
      );
    }
  }
}
