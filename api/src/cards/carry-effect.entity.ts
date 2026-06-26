import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type CarryEffectDuration = 'this_game' | 'next_game' | 'permanent';

@Entity('carry_effects')
export class CarryEffectEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'player_id' })
  playerId: string;

  @Column({ name: 'player_email', nullable: true })
  playerEmail: string;

  @Column({ name: 'effect_label' })
  effectLabel: string;

  @Column({ name: 'effect_description', nullable: true })
  effectDescription: string;

  @Column({ type: 'varchar' })
  duration: CarryEffectDuration;

  @Column({ name: 'source_card_id', nullable: true })
  sourceCardId: string;

  @Column({ name: 'source_card_name', nullable: true })
  sourceCardName: string;

  @Column({ name: 'game_session_id', nullable: true })
  gameSessionId: string;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
