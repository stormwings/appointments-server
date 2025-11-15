import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  HasMany,
  CreatedAt,
  UpdatedAt,
  Index,
} from 'sequelize-typescript';
import { ParticipantModel } from './participant.model';
import type {
  AppointmentStatus,
  Meta,
  Identifier,
  CodeableConcept,
  Reference,
  Period,
} from '../../../appointment';

@Table({
  tableName: 'appointments',
  timestamps: true,
  indexes: [{ fields: ['status'] }, { fields: ['start'] }],
})
export class AppointmentModel extends Model {
  @PrimaryKey
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'Appointment',
  })
  declare resourceType: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  declare meta?: Meta;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  declare identifier?: Identifier[];

  @Index
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare status: AppointmentStatus;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  declare cancellationReason?: CodeableConcept;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  declare serviceCategory?: CodeableConcept[];

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  declare serviceType?: CodeableConcept[];

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  declare specialty?: CodeableConcept[];

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  declare appointmentType?: CodeableConcept;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  declare reasonCode?: CodeableConcept[];

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  declare reasonReference?: Reference[];

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare priority?: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description?: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  declare supportingInformation?: Reference[];

  @Index
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare start?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare end?: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare minutesDuration?: number;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  declare slot?: Reference[];

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare created?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare comment?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare patientInstruction?: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  declare basedOn?: Reference[];

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  declare requestedPeriod?: Period[];

  @HasMany(() => ParticipantModel, {
    foreignKey: 'appointmentId',
    onDelete: 'CASCADE',
  })
  declare participants?: ParticipantModel[];

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare createdAt: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare updatedAt: Date;
}
