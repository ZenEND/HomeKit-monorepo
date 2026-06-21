import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { GenerateTextDto } from './dto/generate-text.dto';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('models/health')
  async getModelsHealth(@Query('refresh') refresh?: string) {
    // refresh is optional — omit it to use cached results for ~10 minutes
    return this.aiService.getModelsHealth(refresh === 'true');
  }

  @Post('generate-text')
  async generateText(@Body() generateTextDto: GenerateTextDto) {
    return this.aiService.generateText(generateTextDto);
  }
}
