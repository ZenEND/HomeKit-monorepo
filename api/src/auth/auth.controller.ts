import {Controller, Post, Body} from '@nestjs/common';
import {ApiBody, ApiOkResponse, ApiOperation, ApiTags} from '@nestjs/swagger';
import {AuthService} from "./auth.service";
import {LoginDto} from "./dto/login.dto";
import {RegisterDto} from "./dto/register.dto";
import {UsersEntity} from "../users/users.entity";

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @ApiOperation({
    summary: 'Log in with email and password',
    description: 'Returns a JWT bearer token for authenticated API requests.',
  })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'JWT access token',
    schema: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
  })
  private login(@Body() data: LoginDto): Promise<string | never> {
    return this.authService.login(data);
  }

  @Post("register")
  @ApiOperation({
    summary: 'Register a new user account',
    description: 'Creates a new user with the Guest role and returns the created user profile.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiOkResponse({ type: UsersEntity })
  private register(@Body() data: RegisterDto) {
    return this.authService.register(data);
  }
}
