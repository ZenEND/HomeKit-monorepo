import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EffectInstance } from '@homekit/engine';
import { CardStats, CardStatus, CardType } from '../../card.entity';

export class CardResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() game: string;
  @ApiProperty() type: CardType;
  @ApiPropertyOptional() subtype: string;
  @ApiProperty() name: string;
  @ApiPropertyOptional() description: string;
  @ApiPropertyOptional() flavorText: string;
  @ApiPropertyOptional() imageUrl: string;
  @ApiPropertyOptional() stats: CardStats;
  @ApiProperty({ type: 'array' }) effects: EffectInstance[];
  @ApiPropertyOptional({ type: [String] }) tags: string[];
  @ApiProperty() enabled: boolean;
  @ApiProperty() status: CardStatus;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
