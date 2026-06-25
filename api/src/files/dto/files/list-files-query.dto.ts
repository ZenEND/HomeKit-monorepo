import {ApiPropertyOptional} from "@nestjs/swagger";
import {IsInt, IsOptional, IsString, IsUUID, Max, Min} from "class-validator";
import {Type} from "class-transformer";


export class ListFilesQueryDto {
  @ApiPropertyOptional({
    example: '1',
    description: 'Page number',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: '20',
    description: 'Items per page',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    example: 'cat',
    description: 'Search by name',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 'f7cbfb7a-b3f1-4f55-9d7a-8f558c35b9dc',
    description: 'Folder id. Empty means root folder',
  })
  @IsOptional()
  @IsUUID()
  folderId?: string;
}
