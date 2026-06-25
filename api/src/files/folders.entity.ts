import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn, UpdateDateColumn
} from "typeorm";
import {UsersEntity} from "../users/users.entity";
import {StoredFilesEntity} from "./stored-file.entity";

@Entity('folders')
export class FolderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  ownerId: string;

  @ManyToOne(() => UsersEntity, (user) => user.folders, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ownerId' })
  owner: UsersEntity;

  @Column({ nullable: true })
  parentId: string | null;

  @ManyToOne(() => FolderEntity, (folder) => folder.children, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  parent?: FolderEntity | null;

  @OneToMany(() => FolderEntity, (folder) => folder.parent)
  children: FolderEntity[];

  @OneToMany(() => StoredFilesEntity, (file) => file.folder)
  files: StoredFilesEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

