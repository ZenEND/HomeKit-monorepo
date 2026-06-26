import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { RolesEnum } from '../users/interfaces/roles.enum';
import { UsersEntity } from '../users/users.entity';
import { CardEntity } from '../cards/card.entity';
import { GameEntity } from '../games/game.entity';

@Injectable()
export class DatabaseSeedService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseSeedService.name);

  constructor(
    @InjectRepository(UsersEntity)
    private readonly userRepo: Repository<UsersEntity>,
    @InjectRepository(CardEntity)
    private readonly cardRepo: Repository<CardEntity>,
    @InjectRepository(GameEntity)
    private readonly gameRepo: Repository<GameEntity>,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedAdmin();
    await this.seedMunchkinGame();

    // Opt-in card seeding: set SEED_CARDS=true in .env or environment.
    // Safe to run multiple times — uses upsert by seed ID.
    if (this.config.get<string>('SEED_CARDS') === 'true') {
      await this.seedMunchkinCards();
    }
  }

  // ── Admin user ─────────────────────────────────────────────────────────────

  private async seedAdmin(): Promise<void> {
    const email = this.config.get<string>('ADMIN_EMAIL');
    const password = this.config.get<string>('ADMIN_PASSWORD');

    if (!email || !password) {
      this.logger.warn('ADMIN_EMAIL or ADMIN_PASSWORD not set — skipping admin seed');
      return;
    }

    const hashed = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    const existing = await this.userRepo.findOne({ where: { email } });

    if (existing) {
      existing.password = hashed;
      existing.roles = [RolesEnum.Admin];
      await this.userRepo.save(existing);
      this.logger.log(`Admin user ensured: ${email}`);
      return;
    }

    await this.userRepo.save(
      this.userRepo.create({ email, password: hashed, roles: [RolesEnum.Admin] }),
    );
    this.logger.log(`Admin user created: ${email}`);
  }

  // ── Munchkin cards ─────────────────────────────────────────────────────────

  private async seedMunchkinCards(): Promise<void> {
    // Lazy import — engine seed data is large, only load when explicitly seeding
    const { ALL_MUNCHKIN_CARDS } = await import('@homekit/engine');

    const existing = await this.cardRepo.count({ where: { game: 'Munchkin' } });
    if (existing > 0) {
      this.logger.log(`Cards already seeded (${existing} Munchkin cards in DB) — skipping`);
      return;
    }

    const entities = ALL_MUNCHKIN_CARDS.map((card) => {
      const entity = new CardEntity();
      entity.game = 'Munchkin';
      entity.type = card.type as CardEntity['type'];
      entity.subtype = card.subtype ?? '';
      entity.name = card.name;
      entity.description = card.description ?? '';
      entity.flavorText = card.flavorText ?? '';
      entity.effects = [];
      entity.tags = [card.subtype ?? ''].filter(Boolean);
      entity.enabled = true;
      entity.status = 'published' as CardEntity['status'];
      entity.situationText = card.situationText ?? '';
      entity.diceRollConfig = (card.diceRollConfig as unknown as Record<string, unknown>) ?? null;
      return entity;
    });

    // Insert in batches of 50 to avoid overwhelming the DB
    const BATCH = 50;
    for (let i = 0; i < entities.length; i += BATCH) {
      await this.cardRepo.save(entities.slice(i, i + BATCH));
    }

    this.logger.log(`Seeded ${entities.length} Munchkin cards`);
  }

  // ── Munchkin game ──────────────────────────────────────────────────────────

  private async seedMunchkinGame(): Promise<void> {
    const existing = await this.gameRepo.findOne({ where: { name: 'Munchkin' } });
    if (existing) {
      this.logger.log('Munchkin game already seeded — skipping');
      return;
    }

    const game = new GameEntity();
    game.name = 'Munchkin';
    game.description = 'The classic card game where you kick in the door, kill the monster, grab the treasure and stab your buddy. First to level 10 wins.';
    game.pluginIds = ['munchkin'];
    game.config = {};
    game.enabled = true;
    game.status = 'published';
    game.imageFileId = null;
    game.imageFolderId = null;

    await this.gameRepo.save(game);
    this.logger.log('Seeded Munchkin game');
  }

  // ── Manual trigger (call from CLI / e2e tests) ─────────────────────────────

  async runCardSeed(): Promise<{ inserted: number }> {
    const before = await this.cardRepo.count({ where: { game: 'Munchkin' } });
    await this.seedMunchkinCards();
    const after = await this.cardRepo.count({ where: { game: 'Munchkin' } });
    return { inserted: after - before };
  }

  async clearCardSeed(): Promise<{ deleted: number }> {
    const result = await this.cardRepo
      .createQueryBuilder()
      .delete()
      .where('game = :game', { game: 'Munchkin' })
      .execute();
    const deleted = result.affected ?? 0;
    this.logger.warn(`Deleted ${deleted} Munchkin seed cards`);
    return { deleted };
  }
}
