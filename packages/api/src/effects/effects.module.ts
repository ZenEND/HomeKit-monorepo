import { Module } from '@nestjs/common';
import { EffectsController } from './effects.controller';

@Module({
  controllers: [EffectsController],
})
export class EffectsModule {}
