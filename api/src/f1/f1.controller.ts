import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { F1Service } from './f1.service';
import { F1DriverStandingsResponse } from './f1.types';

@ApiTags('f1')
@Controller('f1')
export class F1Controller {
  constructor(private readonly f1Service: F1Service) {}

  @Get()
  getF1(): Promise<F1DriverStandingsResponse> {
    return this.f1Service.getF1();
  }
}