import {
  IsString,
  IsEnum,
  IsArray,
  IsOptional,
  ValidateNested,
  ArrayMinSize,
  IsNumber,
  IsPositive,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  AppointmentStatus,
  ParticipantStatus,
  ParticipantRequired,
} from '../../../appointment';

export class CodingDto {
  @IsOptional()
  @IsString()
  system?: string;

  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  display?: string;

  @IsOptional()
  userSelected?: boolean;
}

export class CodeableConceptDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CodingDto)
  coding?: CodingDto[];

  @IsOptional()
  @IsString()
  text?: string;
}

export class PeriodDto {
  @IsOptional()
  @IsString()
  start?: string;

  @IsOptional()
  @IsString()
  end?: string;
}

export class IdentifierDto {
  @IsOptional()
  @IsEnum(['usual', 'official', 'temp', 'secondary', 'old'])
  use?: 'usual' | 'official' | 'temp' | 'secondary' | 'old';

  @IsOptional()
  @ValidateNested()
  @Type(() => CodeableConceptDto)
  type?: CodeableConceptDto;

  @IsOptional()
  @IsString()
  system?: string;

  @IsOptional()
  @IsString()
  value?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PeriodDto)
  period?: PeriodDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ReferenceDto)
  assigner?: ReferenceDto;
}

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
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CodeableConceptDto)
  type?: CodeableConceptDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ReferenceDto)
  actor?: ReferenceDto;

  @IsOptional()
  @IsEnum(ParticipantRequired)
  required?: ParticipantRequired;

  @IsEnum(ParticipantStatus)
  status: ParticipantStatus;

  @IsOptional()
  @ValidateNested()
  @Type(() => PeriodDto)
  period?: PeriodDto;
}

export class CreateAppointmentDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IdentifierDto)
  identifier?: IdentifierDto[];

  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;

  @IsOptional()
  @ValidateNested()
  @Type(() => CodeableConceptDto)
  cancellationReason?: CodeableConceptDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CodeableConceptDto)
  serviceCategory?: CodeableConceptDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CodeableConceptDto)
  serviceType?: CodeableConceptDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CodeableConceptDto)
  specialty?: CodeableConceptDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CodeableConceptDto)
  appointmentType?: CodeableConceptDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CodeableConceptDto)
  reasonCode?: CodeableConceptDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReferenceDto)
  reasonReference?: ReferenceDto[];

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  priority?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReferenceDto)
  supportingInformation?: ReferenceDto[];

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
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReferenceDto)
  slot?: ReferenceDto[];

  @IsOptional()
  @IsString()
  created?: string;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsString()
  patientInstruction?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReferenceDto)
  basedOn?: ReferenceDto[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ParticipantDto)
  participant: ParticipantDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PeriodDto)
  requestedPeriod?: PeriodDto[];
}
