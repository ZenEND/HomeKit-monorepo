import {Controller, Post, Body} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {LoginDto} from "./dto/login.dto";
import {RegisterDto} from "./dto/register.dto";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  private login(@Body() data: LoginDto): Promise<string | never> {
    return this.authService.login(data);
  }

  @Post("register")
  private register(@Body() data: RegisterDto) {
    return this.authService.register(data);
  }
}
