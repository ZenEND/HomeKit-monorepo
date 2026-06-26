import { Controller, Post, Delete, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { RolesEnum } from '../users/interfaces/roles.enum';
import { DatabaseSeedService } from './database.seed.service';

@ApiTags('dev')
@ApiBearerAuth()
@Controller('dev')
export class DatabaseController {
  constructor(private readonly seed: DatabaseSeedService) {}

  @Post('seed/cards')
  @Roles(RolesEnum.Admin)
  @HttpCode(200)
  @ApiOperation({ summary: 'Seed Munchkin cards into the database (admin, dev only)' })
  async seedCards() {
    return this.seed.runCardSeed();
  }

  @Delete('seed/cards')
  @Roles(RolesEnum.Admin)
  @HttpCode(200)
  @ApiOperation({ summary: 'Remove all seeded Munchkin cards (admin, dev only)' })
  async clearCards() {
    return this.seed.clearCardSeed();
  }
}
