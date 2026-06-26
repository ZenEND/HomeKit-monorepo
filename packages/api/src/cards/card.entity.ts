import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EffectInstance } from '@homekit/engine';
import { CardType, CardStatus, CardStats } from '@homekit/types';

export { CardType, CardStatus, CardStats };

@Entity('cards')
export class CardEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'Munchkin' })
  game: string;

  @Column({ type: 'varchar' })
  type: CardType;

  @Column({ nullable: true })
  subtype: string;

  @Column()
  name: string;

  @Column({ nullable: true, length: 120 })
  description: string;

  @Column({ nullable: true, length: 60, name: 'flavor_text' })
  flavorText: string;

  @Column({ nullable: true, name: 'image_url' })
  imageUrl: string;

  @Column({ type: 'uuid', nullable: true, name: 'image_file_id' })
  imageFileId?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  stats: CardStats;

  @Column({ type: 'jsonb', nullable: true, default: '[]' })
  effects: EffectInstance[];

  @Column({ nullable: true, type: 'text', name: 'situation_text' })
  situationText: string;

  @Column({ type: 'jsonb', nullable: true, name: 'dice_roll_config' })
  diceRollConfig: Record<string, unknown>;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ default: true })
  enabled: boolean;

  @Column({ type: 'varchar', default: 'draft' })
  status: CardStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
