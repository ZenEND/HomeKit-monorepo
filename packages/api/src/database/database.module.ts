import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from '../users/users.entity';
import { CardEntity } from '../cards/card.entity';
import { GameEntity } from '../games/game.entity';
import { DatabaseSeedService } from './database.seed.service';
import { DatabaseController } from './database.controller';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProduction = config.get<string>('NODE_ENV') === 'production';
        return {
          type: 'postgres',
          host: config.get<string>('DB_HOST', 'localhost'),
          port: config.get<number>('DB_PORT', 5432),
          username: config.get<string>('DB_USER', 'homekit'),
          password: config.get<string>('DB_PASSWORD', 'homekit'),
          database: config.get<string>('DB_NAME', 'homekit'),
          autoLoadEntities: true,
          // In development: TypeORM auto-alters tables to match entities on startup.
          // In production: set NODE_ENV=production — synchronize is disabled and
          // migrations must be run explicitly via `pnpm migration:run`.
          synchronize: !isProduction,
          // Only enable migration runner in production (explicit opt-in via env).
          migrationsRun: isProduction && config.get<string>('RUN_MIGRATIONS') === 'true',
          migrations: ['dist/database/migrations/*.js'],
          logging: config.get<string>('DB_LOGGING') === 'true' ? 'all' : ['error', 'warn'],
        };
      },
    }),
    TypeOrmModule.forFeature([UsersEntity, CardEntity, GameEntity]),
  ],
  controllers: [DatabaseController],
  providers: [DatabaseSeedService],
  exports: [DatabaseSeedService],
})
export class DatabaseModule {}
