import {
  IsString,
  IsEnum,
  IsArray,
  IsOptional,
  ValidateNested,
  ArrayMinSize,
  IsNumber,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  AppointmentStatus,
  ParticipantStatus,
  ParticipantRequired,
} from '../../../appointment';

export class ReferenceDto {
  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  display?: string;
}

export class ParticipantDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => ReferenceDto)
  actor?: ReferenceDto;

  @IsOptional()
  @IsEnum(ParticipantRequired)
  required?: ParticipantRequired;

  @IsEnum(ParticipantStatus)
  status: ParticipantStatus;
}

export class CreateAppointmentDto {
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  start?: string;

  @IsOptional()
  @IsString()
  end?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  minutesDuration?: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ParticipantDto)
  participant: ParticipantDto[];
}
