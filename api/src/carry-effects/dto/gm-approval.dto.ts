import { IsIn, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GmApprovalDto {
  @ApiProperty({ enum: ['success', 'fail'] })
  @IsIn(['success', 'fail'])
  decision: 'success' | 'fail';

  @ApiProperty({ description: 'Game session ID' })
  @IsString()
  gameId: string;

  @ApiProperty({ description: 'Card ID that triggered GM approval' })
  @IsString()
  cardId: string;

  @ApiProperty({ description: 'Player ID being evaluated' })
  @IsString()
  playerId: string;
}
