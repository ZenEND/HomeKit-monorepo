import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {IsOptional, IsString, IsUUID, MaxLength, MinLength} from "class-validator";


export class CreateFolderDto {
  @ApiProperty({
    example: 'My documents',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    example: 'f7cbfb7a-b3f1-4f55-9d7a-8f558c35b9dc',
    description: 'Parent folder id. Empty means root folder'
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
