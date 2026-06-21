import {Controller, Post, UseGuards, Request} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {AuthGuard} from "@nestjs/passport";
import {RequestWithUser} from "../users/interfaces/request-with-user";
import {ApiBearerAuth} from "@nestjs/swagger";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard("local"))
  @Post("login")
  async login(@Request() req: RequestWithUser) {
    return this.authService.login(req.user);
  }
}
