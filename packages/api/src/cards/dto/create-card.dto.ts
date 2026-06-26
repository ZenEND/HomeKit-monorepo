import {
  Allow,
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CardType } from '../card.entity';
import { EffectInstance } from '@homekit/engine';

export class EffectConditionDto {
  @ApiProperty()
  @IsIn(['phase', 'player_level', 'has_item', 'random_percent'])
  type: 'phase' | 'player_level' | 'has_item' | 'random_percent';

  @ApiProperty()
  @Allow()
  value: unknown;
}

export class EffectInstanceDto {
  @ApiProperty()
  @IsString()
  definitionId: string;

  @ApiProperty()
  @IsObject()
  params: Record<string, unknown>;

  @ApiPropertyOptional({ type: EffectConditionDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => EffectConditionDto)
  condition?: EffectConditionDto;
}

export class CardStatsDto {
  @ApiPropertyOptional() @IsOptional() monsterLevel?: number;
  @ApiPropertyOptional() @IsOptional() treasureReward?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() badStuff?: string;
  @ApiPropertyOptional({ enum: ['Head', 'Body', 'Feet', 'Hand', 'Accessory', 'None'] })
  @IsOptional()
  @IsIn(['Head', 'Body', 'Feet', 'Hand', 'Accessory', 'None'])
  slot?: 'Head' | 'Body' | 'Feet' | 'Hand' | 'Accessory' | 'None';
  @ApiPropertyOptional() @IsOptional() combatBonus?: number;
  @ApiPropertyOptional() @IsOptional() goldValue?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() bigItem?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsArray() raceRestriction?: string[];
  @ApiPropertyOptional() @IsOptional() @IsArray() classRestriction?: string[];
  @ApiPropertyOptional() @IsOptional() itemBonus?: number;
  @ApiPropertyOptional() @IsOptional() itemValue?: number;
}

export class CreateCardDto {
  @ApiPropertyOptional({ default: 'Munchkin' })
  @IsOptional()
  @IsString()
  game?: string;

  @ApiProperty({ enum: ['DOOR', 'TREASURE', 'PARTY', 'SITUATION', 'MINIGAME'] })
  @IsEnum(['DOOR', 'TREASURE', 'PARTY', 'SITUATION', 'MINIGAME'])
  type: CardType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subtype?: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ maxLength: 120 })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  description?: string;

  @ApiPropertyOptional({ maxLength: 60 })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  flavorText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ type: CardStatsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CardStatsDto)
  stats?: CardStatsDto;

  @ApiPropertyOptional({ type: [EffectInstanceDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EffectInstanceDto)
  effects?: EffectInstance[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ enum: ['draft', 'published'], default: 'draft' })
  @IsOptional()
  @IsIn(['draft', 'published'])
  status?: 'draft' | 'published';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  situationText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  diceRollConfig?: Record<string, unknown>;
}
