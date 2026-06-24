import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { F1Service } from './f1.service';

@ApiTags('f1')
@Controller('f1')
export class F1Controller {
  constructor(private readonly f1Service: F1Service) {}

  @Get()
  @ApiOperation({
    summary: 'Get current F1 driver standings',
    description: 'Proxies Jolpica/Ergast API for the current season driver standings.',
  })
  @ApiOkResponse({
    description: 'Driver standings for the active season',
    schema: {
      example: {
        season: '2026',
        round: '5',
        total: 20,
        standings: [],
      },
    },
  })
  getF1() {
    return this.f1Service.getF1();
  }
}
