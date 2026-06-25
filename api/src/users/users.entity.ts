import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import { Exclude } from 'class-transformer';
import { RolesEnum } from "./interfaces/roles.enum";
import {StoredFilesEntity} from "../files/stored-file.entity";
import {FolderEntity} from "../files/folders.entity";


@Entity("users")
export class UsersEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column('enum', { enum: RolesEnum, array: true, default: [RolesEnum.Guest] })
  roles: RolesEnum[];

  @OneToMany(() => StoredFilesEntity, (file) => file.owner)
  files: StoredFilesEntity[];

  @OneToMany(() => FolderEntity, (folder) => folder.owner)
  folders: FolderEntity[];
}
