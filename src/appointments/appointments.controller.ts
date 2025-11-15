import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { QueryAppointmentDto } from './dto/query-appointment.dto';
import { Appointment, AppointmentStatus } from '../../appointment';

@Controller('appointments')
export class AppointmentsController {
  private readonly logger = new Logger(AppointmentsController.name);

  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  async findAll(@Query() queryDto: QueryAppointmentDto) {
    this.logger.log('GET /appointments');
    return this.appointmentsService.findAll(queryDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Appointment> {
    this.logger.log(`GET /appointments/${id}`);
    return this.appointmentsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateAppointmentDto): Promise<Appointment> {
    this.logger.log('POST /appointments');
    return this.appointmentsService.create(createDto);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: AppointmentStatus,
  ): Promise<Appointment> {
    this.logger.log(`PATCH /appointments/${id}/status`);
    return this.appointmentsService.updateStatus(id, status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    this.logger.log(`DELETE /appointments/${id}`);
    return this.appointmentsService.remove(id);
  }
}
