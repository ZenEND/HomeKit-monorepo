import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UsersEntity } from '../users/users.entity';
import { PlanActivityType, PlanStatus } from './plans.enums';
import { MediaTitleEntity } from './media-title.entity';
import type { SimklEpisode } from './simkl.types';

@Entity('plans')
@Index('IDX_plans_user_calendar_item', ['userId', 'calendarItemId'], {
  unique: true,
  where: '"calendarItemId" IS NOT NULL',
})
export class PlanEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => UsersEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;

  @Column({ type: 'varchar', default: PlanActivityType.Watching })
  activityType: PlanActivityType;

  @Column({ type: 'uuid', nullable: true })
  calendarItemId: string | null;

  @ManyToOne(() => MediaTitleEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'calendarItemId' })
  calendarItem: MediaTitleEntity | null;

  @Column()
  title: string;

  @Column({ type: 'varchar', nullable: true })
  posterPath: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  plannedDate: Date | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'varchar', default: PlanStatus.Planned })
  status: PlanStatus;

  @Column({ type: 'varchar', nullable: true })
  sourceUrl: string | null;

  @Column({ type: 'jsonb', nullable: true })
  episode: SimklEpisode | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
