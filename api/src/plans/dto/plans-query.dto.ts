import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsOptional } from 'class-validator';
import { PlanActivityTypeFilter, PlanStatusFilter } from '../plans.enums';

export class PlansQueryDto {
  @ApiPropertyOptional({
    description: 'Filter saved plans by activity type.',
    enum: PlanActivityTypeFilter,
    default: PlanActivityTypeFilter.All,
  })
  @IsOptional()
  @IsIn(Object.values(PlanActivityTypeFilter))
  activityType?: PlanActivityTypeFilter;

  @ApiPropertyOptional({
    description: 'Filter saved plans by status.',
    enum: PlanStatusFilter,
    default: PlanStatusFilter.All,
  })
  @IsOptional()
  @IsIn(Object.values(PlanStatusFilter))
  status?: PlanStatusFilter;

  @ApiPropertyOptional({
    description: 'Include plans on or after this date (ISO 8601 date).',
    example: '2026-06-01',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    description: 'Include plans on or before this date (ISO 8601 date).',
    example: '2026-06-30',
  })
  @IsOptional()
  @IsDateString()
  to?: string;
}
