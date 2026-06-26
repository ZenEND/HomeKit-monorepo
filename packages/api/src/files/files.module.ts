import {Module} from "@nestjs/common";
import {FilesController} from "./files.controller";
import {FilesService} from "./fiels.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {StoredFilesEntity} from "./stored-file.entity";
import {FoldersController} from "./folders.controller";
import {FoldersService} from "./folders.service";
import {FolderEntity} from "./folders.entity";
import { PublicFilesController } from './public-files.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StoredFilesEntity, FolderEntity])],
  controllers: [FilesController, FoldersController, PublicFilesController],
  providers: [FilesService, FoldersService],
  exports: [FilesService, FoldersService],
})

export class FilesModule {}
