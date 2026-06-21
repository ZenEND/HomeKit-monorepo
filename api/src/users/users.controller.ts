import {Controller, Get, UseGuards, Request} from "@nestjs/common";
import {AuthGuard} from "@nestjs/passport";
import {RequestWithUser} from "./interfaces/request-with-user";
import {ApiBearerAuth} from "@nestjs/swagger";


@Controller('users')
export class UsersController {
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard("jwt"))
  @Get("me")
  getProfile(@Request() req: RequestWithUser){
    return req.user;
  }
}
