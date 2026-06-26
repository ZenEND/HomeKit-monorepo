import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameEntity } from './game.entity';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { FoldersService } from '../files/folders.service';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(GameEntity)
    private readonly gamesRepo: Repository<GameEntity>,
    private readonly foldersService: FoldersService,
  ) {}

  async findAll(): Promise<GameEntity[]> {
    return this.gamesRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<GameEntity> {
    const game = await this.gamesRepo.findOne({ where: { id } });
    if (!game) throw new NotFoundException(`Game ${id} not found`);
    return game;
  }

  async create(dto: CreateGameDto, ownerId: string): Promise<GameEntity> {
    const game = new GameEntity();
    game.name = dto.name;
    game.description = dto.description ?? '';
    game.imageFileId = dto.imageFileId ?? null;
    game.pluginIds = dto.pluginIds ?? [];
    game.config = dto.config ?? {};
    game.enabled = dto.enabled ?? true;
    game.status = dto.status ?? 'draft';

    // Create a dedicated folder for game images
    const folder = await this.foldersService.create(
      { name: `Game: ${dto.name}` },
      ownerId,
    );
    game.imageFolderId = folder.id;

    return this.gamesRepo.save(game);
  }

  async update(id: string, dto: UpdateGameDto): Promise<GameEntity> {
    const game = await this.findOne(id);
    Object.assign(game, dto);
    return this.gamesRepo.save(game);
  }

  async remove(id: string): Promise<void> {
    const game = await this.findOne(id);
    await this.gamesRepo.remove(game);
  }
}
