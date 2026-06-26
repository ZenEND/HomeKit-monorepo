import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EffectInstance } from '@homekit/engine';

export type CardType = 'DOOR' | 'TREASURE' | 'PARTY' | 'SITUATION' | 'MINIGAME';
export type CardStatus = 'draft' | 'published';

export interface CardStats {
  // Monster stats
  monsterLevel?: number;
  treasureReward?: number;
  badStuff?: string;
  // Item stats
  slot?: 'Head' | 'Body' | 'Feet' | 'Hand' | 'Accessory' | 'None';
  combatBonus?: number;
  goldValue?: number;
  bigItem?: boolean;
  // Restrictions
  raceRestriction?: string[];
  classRestriction?: string[];
  // Item bonus / value (for item subtype)
  itemBonus?: number;
  itemValue?: number;
}

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

  @Column({ type: 'jsonb', nullable: true })
  stats: CardStats;

  @Column({ type: 'jsonb', nullable: true, default: '[]' })
  effects: EffectInstance[];

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
