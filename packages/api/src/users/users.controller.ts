import {Body, Controller, Get, Inject, Param, Patch, Post, UseInterceptors} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import {CreateUserDto} from "./dto/create-user.dto";
import {UpdateUserDto} from "./dto/update-user.dto";
import {UsersService} from "./users.service";
import {RolesEnum} from "./interfaces/roles.enum";
import {UsersEntity} from "./users.entity";
import {CurrentUser} from "./utils/current-user";
import {Roles} from "../auth/roles.decorator";
import { CurrentUsersInterceptor } from './users.interseptor';

@ApiTags("users")
@Controller('users')
@ApiBearerAuth()
export class UsersController {
  @Inject(UsersService) usersService: UsersService;

  @Get('me')
  @UseInterceptors(CurrentUsersInterceptor)
  @Roles(RolesEnum.Any)
  @ApiOperation({ summary: 'Get the current authenticated user profile' })
  @ApiOkResponse({ type: UsersEntity })
  getProfile(@CurrentUser() user: UsersEntity) {
    return this.usersService.findById(user.id);
  }

  @Patch('me')
  @UseInterceptors(CurrentUsersInterceptor)
  @Roles(RolesEnum.Any)
  @ApiOperation({
    summary: 'Update the current authenticated user profile',
    description: 'Partially update email and/or password for the logged-in user.',
  })
  @ApiOkResponse({ type: UsersEntity })
  updateProfile(@CurrentUser() user: UsersEntity, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUser(user.id, dto);
  }

  @Get(':id')
  @Roles(RolesEnum.Any)
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: UsersEntity })
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a user',
    description: 'Public endpoint for creating a user with explicit roles. Prefer POST /auth/register for sign-up.',
  })
  @ApiOkResponse({ type: UsersEntity })
  createUser(@Body() userDto: CreateUserDto) {
    return this.usersService.createUser(userDto);
  }
}
