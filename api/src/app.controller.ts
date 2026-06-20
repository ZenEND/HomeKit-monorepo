import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DataSource } from 'typeorm';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiOkResponse({
    description: 'Service and database status',
    schema: {
      example: {
        status: 'ok',
        service: 'api',
        database: 'connected',
        timestamp: '2026-06-20T15:00:00.000Z',
      },
    },
  })
  getHealth() {
    const dbConnected = this.dataSource.isInitialized;

    return {
      status: 'ok',
      service: 'api',
      database: dbConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    };
  }
}
