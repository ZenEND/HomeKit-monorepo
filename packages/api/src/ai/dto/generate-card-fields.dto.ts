import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateCardFieldsDto {
  @ApiProperty({ description: 'System prompt with schema instructions and tags context' })
  @IsString()
  systemPrompt: string;

  @ApiProperty({ description: 'User prompt — the card idea description' })
  @IsString()
  userPrompt: string;
}
