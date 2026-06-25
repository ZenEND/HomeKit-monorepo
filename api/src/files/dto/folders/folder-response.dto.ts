import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";

export class FolderResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  ownerId: string;

  @ApiPropertyOptional( { nullable: true } )
  parentId?: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
