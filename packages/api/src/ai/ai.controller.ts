import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { GenerateTextDto } from './dto/generate-text.dto';
import { GenerateCardFieldsDto } from './dto/generate-card-fields.dto';
import { AiService } from './ai.service';
import { Roles } from '../auth/roles.decorator';
import { RolesEnum } from '../users/interfaces/roles.enum';

class GenerateDoorEventDto {
  @IsString()
  seed: string;

  @IsString()
  @IsOptional()
  tone?: string;
}

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('models/health')
  @ApiOperation({
    summary: 'Check configured AI model availability',
    description: 'Returns health for each configured provider/model. Cached for about 10 minutes unless refresh=true.',
  })
  @ApiQuery({
    name: 'refresh',
    required: false,
    description: 'Set to true to bypass the health cache.',
    example: 'false',
  })
  @ApiOkResponse({
    description: 'Model health snapshot',
    schema: {
      example: {
        checkedAt: '2026-06-23T12:00:00.000Z',
        cached: true,
        models: [],
      },
    },
  })
  async getModelsHealth(@Query('refresh') refresh?: string) {
    return this.aiService.getModelsHealth(refresh === 'true');
  }

  @Post('generate-text')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate Alias game words using configured AI providers' })
  @ApiOkResponse({
    description: 'Generated Alias words',
    schema: {
      example: {
        words: [{ word: 'книга', difficulty: 'easy', category: 'home' }],
        model: 'groq-llama-3.1-8b',
      },
    },
  })
  async generateText(@Body() generateTextDto: GenerateTextDto) {
    return this.aiService.generateText(generateTextDto);
  }

  @Post('generate-card-fields')
  @ApiBearerAuth()
  @Roles(RolesEnum.Admin)
  @ApiOperation({
    summary: 'Generate card form fields from a description (admin only)',
    description: 'GPT call that pre-fills card name, description, flavorText, and stat hints. Never called during an active game.',
  })
  @ApiOkResponse({ description: 'CardFormData JSON object' })
  async generateCardFields(@Body() dto: GenerateCardFieldsDto) {
    return this.aiService.generateCardFields(dto.systemPrompt, dto.userPrompt);
  }

  @Post('generate-door-event')
  @ApiBearerAuth()
  @Roles(RolesEnum.Admin)
  @ApiOperation({
    summary: 'Generate a complete Door Event card with dice tiers (admin only)',
    description: 'AI generates situation text + 5 outcome tiers from a seed concept and tone.',
  })
  @ApiOkResponse({ description: 'DoorEvent card data JSON' })
  async generateDoorEvent(@Body() dto: GenerateDoorEventDto) {
    return this.aiService.generateDoorEvent(dto.seed, dto.tone);
  }
}
