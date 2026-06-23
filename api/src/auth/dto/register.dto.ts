import {IsString, MinLength, IsEmail} from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class RegisterDto {
  @IsEmail()
  @ApiProperty({ example: 'email@email.com'})
  public readonly email: string;

  @IsString()
  @MinLength(6)
  @ApiProperty({example: '1234567890'})
  public readonly password: string;

}
