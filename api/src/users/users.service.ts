import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {UsersEntity} from "./users.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private userRepository: Repository<UsersEntity>,
  ) {}

  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email }});
  }

  async create(email: string, password: string) {
    const hash = await bcrypt.hash(password, 10);
    return this.userRepository.insert({email, password: hash});
  }

  async validateCredentials(email: string, password: string) {
    const user = await this.findByEmail(email);
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.password);
    return ok ? ok : null;
  }
}
