import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from '../users/users.entity';
import { DatabaseSeedService } from './database.seed.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USER', 'homekit'),
        password: config.get<string>('DB_PASSWORD', 'homekit'),
        database: config.get<string>('DB_NAME', 'homekit'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([UsersEntity]),
  ],
  providers: [DatabaseSeedService],
})
export class DatabaseModule {}
