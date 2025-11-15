import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    app.enableCors();

    const port = process.env.PORT ?? 8000;

    await app.listen(port);

    logger.log(`Application is running on: http://localhost:${port}`);
    logger.log(`Appointments API: http://localhost:${port}/appointments`);
  } catch (error) {
    logger.error('Failed to bootstrap application', error);
    process.exit(1);
  }
}

bootstrap();
