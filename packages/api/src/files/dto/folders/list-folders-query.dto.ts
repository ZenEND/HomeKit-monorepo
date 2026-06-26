import { ApiPropertyOptional} from "@nestjs/swagger";
import { IsOptional, IsString, IsUUID } from "class-validator";


export class ListFoldersQueryDto {
  @ApiPropertyOptional({
    example: 'f7cbfb7a-b3f1-4f55-9d7a-8f558c35b9dc',
    description: 'Parent folder id. Empty means root folder.',
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({
    example: 'docs',
    description: 'Search by folder name',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
