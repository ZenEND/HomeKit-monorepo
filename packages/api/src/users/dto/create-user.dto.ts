import { IsArray, IsString, MinLength, IsEnum} from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";
import {RolesEnum} from "../interfaces/roles.enum";

export class CreateUserDto {
  @IsString()
  @ApiProperty({ example: 'email@email.com'})
  public readonly email: string;

  @IsString()
  @MinLength(6)
  @ApiProperty({example: '1234567890'})
  public readonly password: string;

  @IsArray()
  @IsEnum(RolesEnum, {each: true})
  @ApiProperty({example: [RolesEnum.Guest]})
  public readonly roles: RolesEnum[];

}
