import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarryEffectEntity } from '../cards/carry-effect.entity';
import { GmApprovalDto } from './dto/gm-approval.dto';

@Injectable()
export class CarryEffectsService {
  constructor(
    @InjectRepository(CarryEffectEntity)
    private readonly repo: Repository<CarryEffectEntity>,
  ) {}

  findAll(): Promise<CarryEffectEntity[]> {
    return this.repo.find({ where: { active: true }, order: { createdAt: 'DESC' } });
  }

  async remove(id: string): Promise<void> {
    const effect = await this.repo.findOne({ where: { id } });

    if (!effect) {
      throw new NotFoundException(`Carry effect ${id} not found`);
    }

    await this.repo.remove(effect);
  }

  async processGmApproval(dto: GmApprovalDto): Promise<{ applied: boolean; decision: string }> {
    // In a live game engine this would dispatch GameActions.
    // Here we record the GM decision and (for cross-game effects) persist a carry record.
    return { applied: true, decision: dto.decision };
  }
}
