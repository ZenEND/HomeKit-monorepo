import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { PlanActivityType } from '../plans.enums';

export class CreatePlanDto {
  @ApiPropertyOptional({
    description: 'Activity category for this plan. Defaults to watching.',
    enum: PlanActivityType,
    default: PlanActivityType.Watching,
  })
  @IsOptional()
  @IsEnum(PlanActivityType)
  activityType?: PlanActivityType;

  @ApiPropertyOptional({
    description: 'Cached Simkl calendar item id for watching plans.',
    format: 'uuid',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @ValidateIf((dto: CreatePlanDto) => !dto.title)
  @IsUUID()
  calendarItemId?: string;

  @ApiPropertyOptional({
    description: 'Title for non-watching activity plans.',
    example: 'Monaco Grand Prix watch party',
    maxLength: 200,
  })
  @ValidateIf((dto: CreatePlanDto) => !dto.calendarItemId)
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    description: 'Planned date for non-watching activity plans (ISO 8601 date).',
    example: '2026-06-15',
  })
  @IsOptional()
  @IsDateString()
  plannedDate?: string;

  @ApiPropertyOptional({
    description: 'Optional personal note for this plan.',
    maxLength: 500,
    example: 'Watch with friends on Friday.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({
    description: 'Activity-specific metadata (e.g. race name, recipe link, player count).',
    example: { ideaId: 'f1-watch-party', groupSize: '4-8' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
