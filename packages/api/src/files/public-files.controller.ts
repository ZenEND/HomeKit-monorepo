import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Param, Res, StreamableFile } from '@nestjs/common';
import { FilesService } from './fiels.service';
import { createReadStream } from 'node:fs';
import { Response } from 'express';

@ApiTags('files')
@Controller('files')
export class PublicFilesController {
  constructor(private readonly fileService: FilesService) {}

  @Get(':id/view-public')
  async viewPublicFile(
    @Param('id') id: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<StreamableFile> {
    const { file, filePath } = await this.fileService.getPublicFileForView(id);

    response.set({
      'Content-Type': file.mimetype,
      'Content-Disposition': 'inline',
    });

    return new StreamableFile(createReadStream(filePath));
  }
}
