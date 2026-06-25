import {ApiBearerAuth, ApiOkResponse, ApiTags} from "@nestjs/swagger";
import {Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards} from "@nestjs/common";
import {Roles} from "../auth/roles.decorator";
import {RolesEnum} from "../users/interfaces/roles.enum";
import {FoldersService} from "./folders.service";
import {RolesGuard} from "../auth/roles.guard";
import {FolderResponseDto} from "./dto/folders/folder-response.dto";
import {CreateFolderDto} from "./dto/folders/create-folder.dto";
import {CurrentUser} from "../users/utils/current-user";
import {UsersEntity} from "../users/users.entity";
import {ListFoldersQueryDto} from "./dto/folders/list-folders-query.dto";
import {UpdateFolderDto} from "./dto/folders/update-folder.dto";

@ApiTags('folders')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(RolesEnum.Any)
@Controller('folders')
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post()
  @ApiOkResponse({
    type: FolderResponseDto,
  })
  create(
    @Body() createFolderDto: CreateFolderDto,
    @CurrentUser() user: UsersEntity,
  ) {
    return this.foldersService.create(createFolderDto, user.id)
  }

  @Get()
  @ApiOkResponse({
    type: [FolderResponseDto],
  })
  findAll(
    @Query() query: ListFoldersQueryDto,
    @CurrentUser() user: UsersEntity,
  ) {
    return this.foldersService.findAll(query, user.id);
  }

  @Get(':id')
  @ApiOkResponse({
    type: FolderResponseDto,
  })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: UsersEntity,
    ) {
    const folder = await this.foldersService.findOne(id, user.id);

    return this.foldersService.toResponse(folder);
  }

  @Patch(':id')
  @ApiOkResponse({
    type: FolderResponseDto,
  })
  update(
    @Param('id') id: string,
    @Body() updateFolderDto: UpdateFolderDto,
    @CurrentUser() user: UsersEntity,
  ) {
    return this.foldersService.update(id, updateFolderDto, user.id);
  }

  @Delete(':id')
  delete(
    @Param('id') id: string,
    @CurrentUser() user: UsersEntity,
  ) {
    return this.foldersService.delete(id, user.id);
  }
}
