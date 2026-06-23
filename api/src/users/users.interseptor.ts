import {BadRequestException, CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor} from "@nestjs/common";
import {UsersService} from "./users.service";


@Injectable()
export class CurrentUsersInterceptor implements NestInterceptor {
  @Inject(UsersService) usersService: UsersService;

  async intercept(context: ExecutionContext, handler: CallHandler) {
    const request = context.switchToHttp().getRequest();

    try {
      const user = request.user;
      console.log('he', request.user);
      request.currentUser = user;
    } catch (error) {
      console.log('Error', error);
      throw new BadRequestException();
    }

    return handler.handle();
  }
}
