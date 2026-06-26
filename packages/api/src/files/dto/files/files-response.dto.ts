import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";

export class FilesResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  originalName: string;

  @ApiProperty()
  filename: string;

  @ApiProperty()
  mimetype: string;

  @ApiProperty()
  extension: string;

  @ApiProperty()
  size: number;

  @ApiProperty()
  sizeKb: number;

  @ApiProperty()
  ownerId: string;

  @ApiPropertyOptional({ nullable: true })
  folderId?: string | null;

  @ApiProperty()
  viewUrl: string;

  @ApiProperty()
  downloadUrl: string;

  @ApiProperty()
  createdAt: Date;
}
