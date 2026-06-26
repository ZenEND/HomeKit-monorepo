import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameEntity } from './game.entity';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [TypeOrmModule.forFeature([GameEntity]), FilesModule],
  controllers: [GamesController],
  providers: [GamesService],
  exports: [GamesService],
})
export class GamesModule {}
