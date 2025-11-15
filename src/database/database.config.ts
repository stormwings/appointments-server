import { Sequelize } from 'sequelize-typescript';
import { ParticipantModel } from './models/participant.model';
import { AppointmentModel } from './models/appointment.model';

export const databaseConfig = {
  dialect: 'sqlite' as const,
  storage: './data/appointments.sqlite',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  models: [AppointmentModel, ParticipantModel],
};

export const createSequelizeInstance = (): Sequelize => {
  const sequelize = new Sequelize({
    ...databaseConfig,
    define: {
      timestamps: true,
      underscored: false,
    },
  });

  return sequelize;
};
