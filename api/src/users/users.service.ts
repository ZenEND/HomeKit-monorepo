import {Injectable, NotFoundException} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {UsersEntity} from "./users.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {CreateUserDto} from "./dto/create-user.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private userRepository: Repository<UsersEntity>,
  ) {}

  async getAllUsers() {
    return this.userRepository.find();
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email }});
  }

  async findById(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    // return this.userRepository.findOne({where: { id }});
    if (!user) {
      throw new NotFoundException("User does not exist");
    }
    return user;
  }

  async createUser(userDto: CreateUserDto) {
    return this.userRepository.save(userDto);
    // const newUser = this.userRepository.create(userDto);
    // await this.userRepository.save({
    //   email: userDto.email,
    //   password: newUser.password,
    //   roles: newUser.roles,
    // });
    // return newUser;
  }

  async validateCredentials(email: string, password: string) {
    const user = await this.findByEmail(email);
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.password);
    return ok ? ok : null;
  }
}
