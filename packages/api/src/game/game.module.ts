import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { RoomManagerService } from './room-manager.service';
import { RedisService } from './redis.service';
import { MonitorController } from './monitor.controller';

@Module({
  providers: [GameGateway, RoomManagerService, RedisService],
  controllers: [MonitorController],
  exports: [GameGateway, RoomManagerService, RedisService],
})
export class GameModule {}
