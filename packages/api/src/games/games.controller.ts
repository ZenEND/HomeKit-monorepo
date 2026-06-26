import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesEnum } from '../users/interfaces/roles.enum';
import { CurrentUser } from '../users/utils/current-user';
import { UsersEntity } from '../users/users.entity';
import { GamesService } from './games.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';

@ApiTags('games')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(RolesEnum.Admin)
@Controller('admin/games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get()
  findAll() {
    return this.gamesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gamesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateGameDto, @CurrentUser() user: UsersEntity) {
    return this.gamesService.create(dto, user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateGameDto) {
    return this.gamesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gamesService.remove(id);
  }
}
