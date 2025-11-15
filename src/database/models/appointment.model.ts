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
import type { AppointmentStatus, Meta } from '../../../appointment';

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

  @Index
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare status: AppointmentStatus;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description?: string;

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
    type: DataType.TEXT,
    allowNull: true,
  })
  declare comment?: string;

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
