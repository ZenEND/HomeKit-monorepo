import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { AI_MODEL_IDS, DEFAULT_AI_MODEL } from '../ai-models.config';

export type GenerateTextDifficulty = 'easy' | 'medium' | 'hard' | 'mixed';

export class GenerateTextDto {
  @ApiProperty({
    description: 'Number of Alias words to generate.',
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  count = 10;

  @ApiProperty({
    description: 'Language for generated words.',
    example: 'Ukrainian',
  })
  @IsString()
  @IsNotEmpty()
  language: string;

  @ApiProperty({
    description: 'Requested word difficulty.',
    enum: ['easy', 'medium', 'hard', 'mixed'],
    default: 'mixed',
  })
  @IsIn(['easy', 'medium', 'hard', 'mixed'])
  difficulty: GenerateTextDifficulty = 'mixed';

  @ApiPropertyOptional({
    description: 'Gemini model id for word generation.',
    enum: AI_MODEL_IDS,
    default: DEFAULT_AI_MODEL,
  })
  @IsOptional()
  @IsIn(AI_MODEL_IDS)
  model?: string;

  @ApiPropertyOptional({
    description: 'Optional topic or category to focus generation on.',
    example: 'movies',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  topic?: string;

  @ApiPropertyOptional({
    description: 'Optional list of categories to distribute generated words across.',
    type: [String],
    example: ['books', 'food', 'travel'],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  categories?: string[];

}
