import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { PlanStatus } from '../plans.enums';

export class UpdatePlanStatusDto {
  @ApiProperty({
    description: 'Updated status for the saved plan.',
    enum: [PlanStatus.Planned, PlanStatus.Watched, PlanStatus.Dropped],
    example: PlanStatus.Watched,
  })
  @IsIn([PlanStatus.Planned, PlanStatus.Watched, PlanStatus.Dropped])
  status: PlanStatus.Planned | PlanStatus.Watched | PlanStatus.Dropped;
}
