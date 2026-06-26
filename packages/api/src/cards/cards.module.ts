import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { CardEntity } from './card.entity';
import { CarryEffectEntity } from './carry-effect.entity';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CardEntity, CarryEffectEntity]),
    MulterModule.register({}),
  ],
  controllers: [CardsController],
  providers: [CardsService],
  exports: [CardsService, TypeOrmModule],
})
export class CardsModule {}
