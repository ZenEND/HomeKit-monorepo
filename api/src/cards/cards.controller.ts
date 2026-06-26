import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { RolesEnum } from '../users/interfaces/roles.enum';
import { CardsService } from './cards.service';
import { CardsQueryDto } from './dto/cards-query.dto';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { CardResponseDto } from './dto/responses/card-response.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

const uploadsDir = './uploads/cards';

@ApiTags('admin/cards')
@Controller('admin/cards')
@ApiBearerAuth()
@Roles(RolesEnum.Admin)
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get()
  @ApiOperation({ summary: 'List all cards with optional filters' })
  @ApiOkResponse({ type: [CardResponseDto] })
  findAll(@Query() query: CardsQueryDto) {
    return this.cardsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single card by ID' })
  @ApiOkResponse({ type: CardResponseDto })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.cardsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new card' })
  @ApiOkResponse({ type: CardResponseDto })
  create(@Body() dto: CreateCardDto) {
    return this.cardsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing card' })
  @ApiOkResponse({ type: CardResponseDto })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCardDto) {
    return this.cardsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a card' })
  @ApiNoContentResponse()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.cardsService.remove(id);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate a card as a new draft' })
  @ApiOkResponse({ type: CardResponseDto })
  duplicate(@Param('id', ParseUUIDPipe) id: string) {
    return this.cardsService.duplicate(id);
  }

  @Post('upload-image')
  @ApiOperation({ summary: 'Upload a card image (JPG, PNG, WebP — max 5 MB)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
        const ext = extname(file.originalname).toLowerCase();
        cb(null, allowed.includes(ext));
      },
      storage: diskStorage({
        destination: (
          _req: Express.Request,
          _file: Express.Multer.File,
          cb: (error: Error | null, destination: string) => void,
        ) => {
          if (!existsSync(uploadsDir)) {
            mkdirSync(uploadsDir, { recursive: true });
          }
          cb(null, uploadsDir);
        },
        filename: (
          _req: Express.Request,
          file: Express.Multer.File,
          cb: (error: Error | null, filename: string) => void,
        ) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return { imageUrl: `/uploads/cards/${file.filename}` };
  }
}
