import {Body, Controller, Get, Inject, Param, Post, UseInterceptors} from "@nestjs/common";
import {ApiBearerAuth, ApiTags} from "@nestjs/swagger";
import {CreateUserDto} from "./dto/create-user.dto";
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
  getProfile(@CurrentUser() user: UsersEntity) {
    return this.usersService.findById(user.id);
  }

  @Get(':id')
  @Roles(RolesEnum.Any)
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  createUser(@Body() userDto: CreateUserDto) {
    return this.usersService.createUser(userDto);
  }
}
