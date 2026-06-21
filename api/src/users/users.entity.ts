import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import { Exclude } from 'class-transformer';
import { RolesEnum } from "./interfaces/roles.enum";


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
}
