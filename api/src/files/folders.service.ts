import {BadRequestException, Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {FolderEntity} from "./folders.entity";
import {FindOptionsWhere, ILike, IsNull, Repository} from "typeorm";
import {StoredFilesEntity} from "./stored-file.entity";
import {CreateFolderDto} from "./dto/folders/create-folder.dto";
import {ListFoldersQueryDto} from "./dto/folders/list-folders-query.dto";
import {UpdateFolderDto} from "./dto/folders/update-folder.dto";

@Injectable()
export class FoldersService {
  constructor(
    @InjectRepository(FolderEntity)
    private readonly folderRepository: Repository<FolderEntity>,

    @InjectRepository(StoredFilesEntity)
    private readonly storedFilesRepository: Repository<StoredFilesEntity>,
  ) {}

  async create(createFolderDto: CreateFolderDto, ownerId: string) {
    const name = createFolderDto.name.trim();

    if (!name) {
      throw new BadRequestException(`Folder name is required`);
    }

    if (createFolderDto.parentId) {
      await this.findOne(createFolderDto.parentId, ownerId);
    }

    const folder = this.folderRepository.create({
      name,
      ownerId,
      parentId: createFolderDto.parentId ?? null,
    });

    const savedFolder = await this.folderRepository.save(folder);

    return this.toResponse(savedFolder);
  }

  async findOne(id: string, ownerId: string): Promise<FolderEntity> {
    const folder = await this.folderRepository.findOne({
      where: {
        id,
        ownerId,
      }
    })

    if (!folder) {
      throw new NotFoundException(`Folder not found`);
    }

    return folder;
  }

  async findAll(query: ListFoldersQueryDto, ownerId: string) {
    const where: FindOptionsWhere<FolderEntity> = {
      ownerId,
    };

    if (query.parentId) {
      await this.findOne(query.parentId, ownerId);
      where.parentId = query.parentId;
    } else {
      where.parentId = IsNull();
    }

    if (query.search) {
      where.name = ILike(`%${query.search}%`);
    }

    const folders = await this.folderRepository.find({
      where,
      order: {
        createdAt: "DESC",
      },
    });

    return folders.map((folder) => this.toResponse(folder));
  }

  async update(id: string, updateFolderDto: UpdateFolderDto, ownerId: string) {
    const folder = await this.findOne(id, ownerId);

    if (updateFolderDto.name != undefined) {
      const name = updateFolderDto.name.trim();

      if (!name) {
        throw new BadRequestException(`Folder name is required`);
      }

      folder.name = name;
    }

    if (updateFolderDto.parentId != undefined) {
      if (updateFolderDto.parentId === id) {
        throw new BadRequestException(`Folder cannot be parent of itself`);
      }

      if (updateFolderDto.parentId) {
        await this.findOne(updateFolderDto.parentId, ownerId);
        await this.ensureFolderIsNotMovedInsideChild(id, updateFolderDto.parentId, ownerId);

        folder.parentId = updateFolderDto.parentId;
      } else {
        folder.parentId = null;
      }
    }

    const updatedFolder = await this.folderRepository.save(folder);

    return this.toResponse(updatedFolder);
  }

  async delete(id: string, ownerId: string) {
    await this.findOne(id, ownerId);

    const childFolderCount = await this.folderRepository.count({
      where: {
        ownerId,
        parentId: id,
      }
    });

    const filesCount = await this.storedFilesRepository.count({
      where: {
        ownerId,
        folderId: id,
      }
    });

    if ( childFolderCount > 0 || filesCount > 0 ) {
      throw new BadRequestException(`Folder is not empty. Delete or move files.`);
    }

    await this.folderRepository.delete({
      id,
      ownerId,
    })

    return {
      message: 'Deleted folder',
      id,
    }
  }

  toResponse(folder: FolderEntity) {
    return {
      id: folder.id,
      name: folder.name,
      ownerId: folder.ownerId,
      parentId: folder.parentId,
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt,
    }
  }

  private async ensureFolderIsNotMovedInsideChild(
    folderId: string,
    newParentId: string,
    ownerId: string,
  ) {
    let currentParentId: string | null | undefined = newParentId;

    while (currentParentId) {
      if (folderId === currentParentId) {
        throw new BadRequestException(
          `Folder cannot be moved inside its own child`
        );
      }
    }

    const parent = await this.folderRepository.findOne({
      where: {
        id: currentParentId,
        ownerId,
      }
    });

    currentParentId = parent?.parentId;
  }
}
