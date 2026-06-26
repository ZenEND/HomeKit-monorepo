import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { RolesEnum } from '../users/interfaces/roles.enum';
import { RoomManagerService } from './room-manager.service';
import { GameGateway } from './game.gateway';
import type { MunchkinGameState } from '@homekit/engine';

class InjectCardDto {
  playerId: string;
  cardId: string;
}

class KickPlayerDto {
  targetPlayerId: string;
}

@ApiTags('admin/monitor')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(RolesEnum.Admin)
@Controller('admin/monitor')
export class MonitorController {
  constructor(
    private readonly roomManager: RoomManagerService,
    private readonly gateway: GameGateway,
  ) {}

  @Get('rooms')
  @ApiOperation({ summary: 'List all active game rooms' })
  async listRooms() {
    return this.roomManager.getAllActiveRooms();
  }

  @Get('rooms/:id')
  @ApiOperation({ summary: 'Get full game state for a room' })
  async getRoom(@Param('id') id: string) {
    return this.roomManager.reconnect(id, 'admin');
  }

  @Post('rooms/:id/force-end')
  @ApiOperation({ summary: 'Force a game to end immediately' })
  async forceEnd(@Param('id') id: string) {
    await this.roomManager.forceEndGame(id);
    const { state } = await this.roomManager.reconnect(id, 'admin');
    this.gateway.broadcastFullState(id, state);
    this.gateway.broadcastSystemMessage(id, 'Admin ended the game.');
    return { success: true };
  }

  @Post('rooms/:id/kick')
  @ApiOperation({ summary: 'Kick a player from a room' })
  async kickPlayer(@Param('id') id: string, @Body() dto: KickPlayerDto) {
    const info = await this.roomManager.kickPlayer(id, dto.targetPlayerId);
    this.gateway.broadcastSystemMessage(id, `Player ${dto.targetPlayerId} was kicked by admin.`);
    return { success: true, info };
  }

  @Post('rooms/:id/inject-card')
  @ApiOperation({ summary: 'Inject a card into a player\'s hand' })
  async injectCard(@Param('id') id: string, @Body() dto: InjectCardDto) {
    const newState = await this.roomManager.injectCard(id, dto.playerId, dto.cardId);
    this.gateway.broadcastFullState(id, newState);
    return { success: true };
  }
}
