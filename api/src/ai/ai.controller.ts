import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { GenerateTextDto } from './dto/generate-text.dto';
import { AiService } from './ai.service';

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
}
