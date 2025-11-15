import { Sequelize } from 'sequelize-typescript';
import { Logger } from '@nestjs/common';
import { createSequelizeInstance } from './database.config';

export const SEQUELIZE = 'SEQUELIZE';

export const databaseProviders = [
  {
    provide: SEQUELIZE,
    useFactory: async (): Promise<Sequelize> => {
      const logger = new Logger('DatabaseProvider');

      try {
        logger.log('Initializing database connection');

        const sequelize = createSequelizeInstance();

        await sequelize.sync({
          alter: process.env.NODE_ENV === 'development',
        });

        logger.log('Database connection established and schema synchronized');
        return sequelize;
      } catch (error) {
        logger.error('Failed to initialize database', error);
        throw error;
      }
    },
  },
];
