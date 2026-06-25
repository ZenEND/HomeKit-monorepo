import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import {UsersModule} from "./users/users.module";
import {AuthModule} from "./auth/auth.module";
import { AiModule } from './ai/ai.module';
import {APP_GUARD} from "@nestjs/core";
import {RolesGuard} from "./auth/roles.guard";
import { F1Module } from './f1/f1.module';
import {FilesModule} from "./files/files.module";
import { ServeStaticModule } from '@nestjs/serve-static';
import {join} from "path";
import { ScheduleModule } from '@nestjs/schedule';
import { PlansModule } from './plans/plans.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    UsersModule,
    AuthModule,
    FilesModule,
    AiModule,
    F1Module,
    PlansModule,
    F1Module,

    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        index: false,
      }
    })
  ],

  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
