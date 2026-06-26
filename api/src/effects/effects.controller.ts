import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { RolesEnum } from '../users/interfaces/roles.enum';
import { createDefaultRegistry, EffectCategory } from '@homekit/engine';

const registry = createDefaultRegistry();

@ApiTags('admin/effects')
@Controller('admin/effects')
@ApiBearerAuth()
@Roles(RolesEnum.Admin)
export class EffectsController {
  @Get()
  @ApiOperation({ summary: 'List all registered effect definitions' })
  @ApiOkResponse({ description: 'Array of EffectDefinition objects from the live registry' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  getEffects(@Query('category') category?: string) {
    if (category) {
      return registry.getByCategory(category as EffectCategory);
    }

    return registry.getAll();
  }
}
