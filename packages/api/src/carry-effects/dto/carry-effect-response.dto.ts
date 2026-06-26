import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CarryEffectResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() playerId: string;
  @ApiPropertyOptional() playerEmail: string;
  @ApiProperty() effectLabel: string;
  @ApiPropertyOptional() effectDescription: string;
  @ApiProperty() duration: string;
  @ApiPropertyOptional() sourceCardId: string;
  @ApiPropertyOptional() sourceCardName: string;
  @ApiPropertyOptional() gameSessionId: string;
  @ApiProperty() active: boolean;
  @ApiProperty() createdAt: Date;
}
