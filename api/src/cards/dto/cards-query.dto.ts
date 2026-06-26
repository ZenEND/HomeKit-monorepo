import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CardsQueryDto {
  @ApiPropertyOptional({ enum: ['DOOR', 'TREASURE', 'PARTY', 'SITUATION', 'MINIGAME'] })
  @IsOptional()
  @IsIn(['DOOR', 'TREASURE', 'PARTY', 'SITUATION', 'MINIGAME'])
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subtype?: string;

  @ApiPropertyOptional({ description: 'Filter by tag (single tag)' })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({ description: 'Filter by effect definition ID' })
  @IsOptional()
  @IsString()
  effectId?: string;

  @ApiPropertyOptional({ enum: ['draft', 'published'] })
  @IsOptional()
  @IsIn(['draft', 'published'])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  game?: string;
}
