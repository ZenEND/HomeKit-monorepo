import {UsersEntity} from "../users.entity";

export type RequestWithUser = Request & {
  user: UsersEntity;
}
