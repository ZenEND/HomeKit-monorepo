import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { RolesEnum } from '../users/interfaces/roles.enum';
import { UsersEntity } from '../users/users.entity';

@Injectable()
export class DatabaseSeedService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseSeedService.name);

  constructor(
    @InjectRepository(UsersEntity)
    private readonly userRepository: Repository<UsersEntity>,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    const email = this.config.get<string>('ADMIN_EMAIL');
    const password = this.config.get<string>('ADMIN_PASSWORD');

    if (!email || !password) {
      this.logger.warn('ADMIN_EMAIL or ADMIN_PASSWORD not set — skipping admin seed');
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const existing = await this.userRepository.findOne({ where: { email } });

    if (existing) {
      existing.password = hashedPassword;
      existing.roles = [RolesEnum.Admin];
      await this.userRepository.save(existing);
      this.logger.log(`Admin user updated: ${email}`);
      return;
    }

    const admin = this.userRepository.create({
      email,
      password: hashedPassword,
      roles: [RolesEnum.Admin],
    });

    await this.userRepository.save(admin);
    this.logger.log(`Admin user created: ${email}`);
  }
}
