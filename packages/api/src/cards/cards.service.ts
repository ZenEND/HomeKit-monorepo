import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CardEntity } from './card.entity';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { CardsQueryDto } from './dto/cards-query.dto';
import { EffectInstance } from '@homekit/engine';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(CardEntity)
    private readonly cardsRepo: Repository<CardEntity>,
  ) {}

  async findAll(query: CardsQueryDto): Promise<CardEntity[]> {
    const qb = this.cardsRepo.createQueryBuilder('card');

    if (query.type) {
      qb.andWhere('card.type = :type', { type: query.type });
    }
    if (query.subtype) {
      qb.andWhere('card.subtype = :subtype', { subtype: query.subtype });
    }
    if (query.status) {
      qb.andWhere('card.status = :status', { status: query.status });
    }
    if (query.game) {
      qb.andWhere('card.game = :game', { game: query.game });
    }
    if (query.tag) {
      qb.andWhere(':tag = ANY(card.tags)', { tag: query.tag });
    }
    if (query.effectId) {
      qb.andWhere(
        `EXISTS (SELECT 1 FROM jsonb_array_elements(card.effects) AS e WHERE e->>'definitionId' = :effectId)`,
        { effectId: query.effectId },
      );
    }

    return qb.orderBy('card.createdAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<CardEntity> {
    const card = await this.cardsRepo.findOne({ where: { id } });

    if (!card) {
      throw new NotFoundException(`Card ${id} not found`);
    }

    return card;
  }

  async create(dto: CreateCardDto): Promise<CardEntity> {
    const card = new CardEntity();
    card.game = dto.game ?? 'Munchkin';
    card.type = dto.type;
    card.subtype = dto.subtype ?? '';
    card.name = dto.name;
    card.description = dto.description ?? '';
    card.flavorText = dto.flavorText ?? '';
    card.imageUrl = dto.imageUrl ?? '';
    card.imageFileId = dto.imageFileId ?? null;
    card.stats = (dto.stats as CardEntity['stats']) ?? {};
    card.effects = (dto.effects as EffectInstance[]) ?? [];
    card.situationText = dto.situationText ?? '';
    card.diceRollConfig = dto.diceRollConfig ?? (null as unknown as Record<string, unknown>);
    card.tags = dto.tags ?? [];
    card.enabled = dto.enabled ?? true;
    card.status = dto.status ?? 'draft';

    return this.cardsRepo.save(card);
  }

  async update(id: string, dto: UpdateCardDto): Promise<CardEntity> {
    const card = await this.findOne(id);
    Object.assign(card, dto);
    return this.cardsRepo.save(card);
  }

  async remove(id: string): Promise<void> {
    const card = await this.findOne(id);
    await this.cardsRepo.remove(card);
  }

  async duplicate(id: string): Promise<CardEntity> {
    const original = await this.findOne(id);
    const clone = new CardEntity();
    clone.game = original.game;
    clone.type = original.type;
    clone.subtype = original.subtype;
    clone.name = `${original.name} (copy)`;
    clone.description = original.description;
    clone.flavorText = original.flavorText;
    clone.imageUrl = original.imageUrl;
    clone.stats = original.stats;
    clone.effects = original.effects;
    clone.tags = original.tags;
    clone.enabled = original.enabled;
    clone.status = 'draft';

    return this.cardsRepo.save(clone);
  }
}
