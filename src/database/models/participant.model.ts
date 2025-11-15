import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  AutoIncrement,
} from 'sequelize-typescript';
import { AppointmentModel } from './appointment.model';
import type {
  ParticipantStatus,
  ParticipantRequired,
  Reference,
  CodeableConcept,
  Period,
} from '../../../appointment';

@Table({
  tableName: 'participants',
  timestamps: false,
})
export class ParticipantModel extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare id: number;

  @ForeignKey(() => AppointmentModel)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare appointmentId: string;

  @BelongsTo(() => AppointmentModel)
  declare appointment?: AppointmentModel;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  declare type?: CodeableConcept[];

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  declare actor?: Reference;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare required?: ParticipantRequired;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare status: ParticipantStatus;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  declare period?: Period;
}
