import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarryEffectEntity } from '../cards/carry-effect.entity';
import { CarryEffectsController } from './carry-effects.controller';
import { CarryEffectsService } from './carry-effects.service';

@Module({
  imports: [TypeOrmModule.forFeature([CarryEffectEntity])],
  controllers: [CarryEffectsController],
  providers: [CarryEffectsService],
})
export class CarryEffectsModule {}
