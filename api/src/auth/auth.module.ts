import {forwardRef, Module} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import {AuthStrategy} from "./auth.strategy";
import {UsersModule} from "../users/users.module";
import {PassportModule} from "@nestjs/passport";
import {JwtModule} from "@nestjs/jwt";
import {ConfigService} from "@nestjs/config";

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user',
      secret: false,
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_KEY')??'123',
        signOptions: { expiresIn: config.get('JWT_EXPIRES') ?? '1d'},
      }),
    }),
    forwardRef(() => UsersModule),
  ],

  providers: [AuthService, AuthStrategy],
  controllers: [AuthController]
})
export class AuthModule {}
