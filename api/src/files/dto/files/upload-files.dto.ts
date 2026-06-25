import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {IsOptional, IsUUID, ValidateIf} from "class-validator";
import {Transform} from "class-transformer";

export class UploadFilesDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'File(s) to upload',
  })
  file: any;

  @ApiPropertyOptional({
    example: 'f7cbfb7a-b3f1-4f55-9d7a-8f558c35b9dc',
    description: 'Folder id. Empty means root folder',
    required: false,
  })
  @Transform(({value}) => (value === "" ? undefined : value))
  @ValidateIf((_object, value) => value !==undefined && value !== "")
  @IsOptional()
  @IsUUID()
  folderId?: string;
}
