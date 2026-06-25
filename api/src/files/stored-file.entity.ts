import {Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {UsersEntity} from "../users/users.entity";
import {FolderEntity} from "./folders.entity";

@Entity('files')
export class StoredFilesEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  originalName: string;

  @Column()
  filename: string;

  @Column()
  mimetype: string;

  @Column()
  extension: string;

  @Column({ type: 'int' })
  size: number;

  @Column()
  ownerId: string;

  @ManyToOne(() => UsersEntity, (user) => user.files, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ownerId' })
  owner: UsersEntity;

  @Column({ nullable: true })
  folderId?: string | null;

  @ManyToOne(() => FolderEntity, (folder) => folder.files, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'folderId' })
  folder?: FolderEntity | null;

  @CreateDateColumn()
  createdAt: Date;
}
