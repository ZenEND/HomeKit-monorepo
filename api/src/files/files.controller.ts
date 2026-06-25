import {ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiTags} from "@nestjs/swagger";
import {
  Body,
  Controller,
  Delete, Get,
  Param,
  Post, Query, Res, StreamableFile,
  UploadedFile, UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { FilesService } from "./fiels.service";
import { multerOptions } from "./config/multer.config";
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadFilesDto } from "./dto/files/upload-files.dto";
import { FilesResponseDto } from "./dto/files/files-response.dto";
import { ListFilesQueryDto } from "./dto/files/list-files-query.dto";
import { createReadStream } from "node:fs";
import { Response } from 'express';
import {RolesGuard} from "../auth/roles.guard";
import {RolesEnum} from "../users/interfaces/roles.enum";
import {Roles} from "../auth/roles.decorator";
import {CurrentUser} from "../users/utils/current-user";
import {UsersEntity} from "../users/users.entity";

@ApiTags("files")
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(RolesEnum.Any)
@Controller("files")
export class FilesController {
  constructor(private readonly fileService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload file',
    type: UploadFilesDto,
  })
  @ApiOkResponse({
    type: FilesResponseDto,
  })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadFilesDto,
    @CurrentUser() user: UsersEntity,
    ){
    const savedFile = await this.fileService.saveUploadedFile(
      file,
      user.id,
      body.folderId || undefined,
    );

    return this.fileService.toResponse(savedFile);
  }

  @Get()
  async findAll(
    @Query() query: ListFilesQueryDto,
    @CurrentUser() user: UsersEntity,
  ) {
    return this.fileService.findAll(query, user.id);
  }

  @Get(':id')
  @ApiOkResponse({
    type: FilesResponseDto,
  })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: UsersEntity,
    ) {
    const file = await this.fileService.findOne(id, user.id);

    return this.fileService.toResponse(file);
  }

  @Get(':id/view')
  async viewFile(
    @Param('id') id: string,
    @Res({ passthrough: true }) response: Response,
    @CurrentUser() user: UsersEntity,
  ): Promise<StreamableFile> {
    const { file, filePath } = await this.fileService.getFileForView(id, user.id);

    response.set({
      'Content-Type': file.mimetype,
      'Content-Disposition': `inline; filename*=UTF-8'${encodeURIComponent(file.originalName)}`,
    })

    return new StreamableFile(createReadStream(filePath));
  }

  @Get(':id/download')
  async downloadFile(
    @Param('id') id: string,
    @Res({ passthrough: true }) response: Response,
    @CurrentUser() user: UsersEntity,
    ):Promise<StreamableFile> {
    const { file, filePath } = await this.fileService.getFileForView(id, user.id);

    response.set({
      'Content-Type': file.mimetype,
      'Content-Disposition': `attachment; filename*=UTF-8'${encodeURIComponent(file.originalName)}`,
    })

    return new StreamableFile(createReadStream(filePath));
  }

  @Delete(':id')
  async deleteFile(
    @Param('id') id: string,
    @CurrentUser() user: UsersEntity,) {
    return this.fileService.deleteFile(id, user.id);
  }
}
