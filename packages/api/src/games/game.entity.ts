import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('games')
export class GameEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ type: 'uuid', nullable: true, name: 'image_file_id' })
  imageFileId: string | null;

  @Column({ type: 'uuid', nullable: true, name: 'image_folder_id' })
  imageFolderId: string | null;

  @Column({ type: 'simple-array', nullable: true, name: 'plugin_ids' })
  pluginIds: string[];

  @Column({ type: 'jsonb', nullable: true })
  config: Record<string, unknown>;

  @Column({ default: true })
  enabled: boolean;

  @Column({ type: 'varchar', default: 'draft' })
  status: 'draft' | 'published';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
