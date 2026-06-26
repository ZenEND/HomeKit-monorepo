import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { RolesEnum } from '../users/interfaces/roles.enum';
import { CarryEffectsService } from './carry-effects.service';
import { CarryEffectResponseDto } from './dto/carry-effect-response.dto';
import { GmApprovalDto } from './dto/gm-approval.dto';

@ApiTags('admin/carry-effects')
@Controller('admin/carry-effects')
@ApiBearerAuth()
@Roles(RolesEnum.Admin)
export class CarryEffectsController {
  constructor(private readonly service: CarryEffectsService) {}

  @Get()
  @ApiOperation({ summary: 'List all active cross-game carry effects' })
  @ApiOkResponse({ type: [CarryEffectResponseDto] })
  findAll() {
    return this.service.findAll();
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a carry effect from a player' })
  @ApiNoContentResponse()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }

  @Post('gm-approval')
  @ApiOperation({ summary: 'Process a GM approval decision for a played card' })
  @ApiOkResponse()
  gmApproval(@Body() dto: GmApprovalDto) {
    return this.service.processGmApproval(dto);
  }
}
