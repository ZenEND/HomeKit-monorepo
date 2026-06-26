import {BadRequestException, Injectable, NotFoundException} from "@nestjs/common";
import { UPLOAD_DIR } from "./config/multer.config";
import {basename, extname, join} from "path";
import { existsSync } from "fs";
import { unlink } from "fs/promises";
import {InjectRepository} from "@nestjs/typeorm";
import {StoredFilesEntity} from "./stored-file.entity";
import {FindOptionsWhere, ILike, IsNull, Repository} from "typeorm";
import {ListFilesQueryDto} from "./dto/files/list-files-query.dto";
import {FolderEntity} from "./folders.entity";

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(StoredFilesEntity)
    private readonly filesRepository: Repository<StoredFilesEntity>,

    @InjectRepository(FolderEntity)
    private readonly foldersRepository: Repository<FolderEntity>,
  ) {}

  async saveUploadedFile(
    file: Express.Multer.File,
    ownerId: string,
    folderId?: string,
    ): Promise<StoredFilesEntity> {
    if (!file){
      throw new BadRequestException("No file to upload");
    }

    if (folderId) {
      await this.assertFolderBelongsToOwner(folderId, ownerId);
    }

    try{
      const storedFile = this.filesRepository.create({
        originalName: file.originalname,
        filename: file.filename,
        mimetype: file.mimetype,
        extension: extname(file.originalname).replace(".", "").toLowerCase(),
        size: file.size,
        ownerId,
        folderId: folderId || null,
      });

      return await this.filesRepository.save(storedFile);
    } catch (error) {
      const filePath = this.getSafeFilePath(file.filename);

      if (existsSync(filePath)){
        await unlink(filePath);
      }

      throw error;
    }

  }

  async findAll(query: ListFilesQueryDto, ownerId: string) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    // const where = {
    //   ownerId,
    //   ...(query.search
    //     ? {
    //       originalName: ILike(`%${query.search}%`),
    //     }
    //     : {}),
    // };

    const where: FindOptionsWhere<StoredFilesEntity> = {
      ownerId,
    }

    if (query.folderId) {
      await this.assertFolderBelongsToOwner(query.folderId, ownerId);
      where.folderId = query.folderId;
    } else {
      where.folderId = IsNull();
    }

    if (query.search) {
      where.originalName = ILike(`%${query.search}%`);
    }

    const [files, total] = await this.filesRepository.findAndCount({
      where,
      order: {
        createdAt: 'DESC',
      },
      skip,
      take: limit,
    });

    return {
      data: files.map((file) => this.toResponse(file)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, ownerId: string): Promise<StoredFilesEntity> {
    const file = await this.filesRepository.findOne({
      where: {
        id,
        ownerId
      }
    });

    if (!file) {
      throw new NotFoundException("No file found");
    }

    return file;
  }

  async getFileForView(id: string, ownerId: string) {
    const file = await this.findOne(id, ownerId);
    const filePath = this.getSafeFilePath(file.filename);

    if (!existsSync(filePath)) {
      throw new NotFoundException("File not found");
    }

    return {
      file,
      filePath,
    };
  }

  async getPublicFileForView(id: string) {
    const file = await this.filesRepository.findOne({ where: { id } });
    if (!file) throw new NotFoundException('File not found');
    const filePath = this.getSafeFilePath(file.filename);
    if (!existsSync(filePath)) throw new NotFoundException('File not found');
    return { file, filePath };
  }

  async deleteFile(id: string, ownerId: string) {
    const file = await this.findOne(id, ownerId);
    const filePath = this.getSafeFilePath(file.filename);

    if (existsSync(filePath)) {
      await unlink(filePath);
    }

    await this.filesRepository.delete({ id, ownerId });

    return {
      massage: 'File deleted',
      id,
    };
  }

  toResponse(file: StoredFilesEntity) {
    return {
      id: file.id,
      originalName: file.originalName,
      filename: file.filename,
      mimetype: file.mimetype,
      extension: file.extension,
      size: file.size,
      sizeKb: Math.round((file.size / 1024) * 100) / 100,
      ownerId: file.ownerId,
      folderId: file.folderId,
      viewUrl: `/files/${file.id}/view`,
      downloadUrl: `/files/${file.id}/download`,
      createdAt: file.createdAt,
    }
  }

  private async assertFolderBelongsToOwner(
    folderId: string,
    ownerId: string,
  ) {
    const folder = await this.foldersRepository.findOne({
      where: {
        id: folderId,
        ownerId,
      }
    })

    if (!folder) {
      throw new NotFoundException("No folder found");
    }

    return folder;
  }

  private getSafeFilePath(filename: string): string {
    const safeFilename = basename(filename);

    if (safeFilename !== filename) {
      throw new BadRequestException('Invalid file name');
    }

    return join(UPLOAD_DIR, safeFilename);
  }
}
