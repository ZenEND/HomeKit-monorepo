import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { PlanActivityType } from '../plans.enums';

export class RecommendationsQueryDto {
  @ApiProperty({
    description: 'Activity type to get recommendations for.',
    enum: PlanActivityType,
    example: PlanActivityType.Watching,
  })
  @IsIn(Object.values(PlanActivityType))
  activity: PlanActivityType;
}
