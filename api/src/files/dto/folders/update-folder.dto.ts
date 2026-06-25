import {ApiPropertyOptional} from "@nestjs/swagger";
import {IsOptional, IsString, IsUUID, MaxLength, MinLength} from "class-validator";

export class UpdateFolderDto {
  @ApiPropertyOptional({
    example: 'Rename folder',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    example: 'f7cbfb7a-b3f1-4f55-9d7a-8f558c35b9dc',
    description: 'New parent folder id. Empty means move to root.',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  parentId?: string | null;
}
