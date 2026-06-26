import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlanActivityType } from '../../plans.enums';

export class IdeaCardDto {
  @ApiProperty({ example: 'f1-watch-party' })
  id: string;

  @ApiProperty({ example: 'F1 Race-Day Watch Party' })
  title: string;

  @ApiProperty({ example: '🏎️' })
  emoji: string;

  @ApiPropertyOptional({ example: 'Adrenaline + snacks' })
  vibe: string | null;

  @ApiPropertyOptional({ example: '3–10' })
  groupSize: string | null;

  @ApiProperty({ example: 'Gather for a Grand Prix with a prediction pool and themed snacks.' })
  summary: string;

  @ApiPropertyOptional({ type: [String] })
  howItWorks: string[] | null;

  @ApiPropertyOptional({ example: 'Uses the Formula 1 Fun page.' })
  homekitTieIn: string | null;

  @ApiPropertyOptional({ example: 'https://wsrv.nl/?url=...' })
  posterUrl: string | null;

  @ApiPropertyOptional({ example: 42 })
  rank: number | null;

  @ApiPropertyOptional({ example: 8.4 })
  rating: number | null;

  @ApiPropertyOptional({ example: 'trending', enum: ['trending', 'top-rated'] })
  tag: 'trending' | 'top-rated' | null;
}

export class RecommendationSectionDto {
  @ApiProperty({ example: 'trending' })
  section: string;

  @ApiProperty({ example: 'Trending this season' })
  title: string;

  @ApiProperty({ type: [IdeaCardDto] })
  items: IdeaCardDto[];
}

export class RecommendationsResponseDto {
  @ApiProperty({ enum: PlanActivityType, example: PlanActivityType.Watching })
  activity: PlanActivityType;

  @ApiProperty({ type: [RecommendationSectionDto] })
  sections: RecommendationSectionDto[];
}
