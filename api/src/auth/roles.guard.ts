import {ExecutionContext, Injectable, UnauthorizedException} from "@nestjs/common";
import {Reflector} from "@nestjs/core";
import {ROLES_KEY} from "./roles.decorator";
import {AuthGuard, IAuthGuard} from "@nestjs/passport";
import {UsersEntity} from "../users/users.entity";
import {RolesEnum} from "../users/interfaces/roles.enum";

@Injectable()
export class RolesGuard extends AuthGuard("jwt") implements IAuthGuard {
  constructor(private reflector: Reflector) {
    super();
  }

  public handleRequest(err: unknown, user: UsersEntity): any {
    if (err || !user) throw err || new UnauthorizedException();
    return user;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<RolesEnum[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) return true;

    await super.canActivate(context);

    const request = context.switchToHttp().getRequest();
    const user = request.user as UsersEntity;

    request.currentUser = user;

    if (requiredRoles.includes(RolesEnum.Any)) return !!user;

    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
