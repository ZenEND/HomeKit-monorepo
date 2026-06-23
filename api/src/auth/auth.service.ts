import {HttpException, HttpStatus, Injectable, UnauthorizedException} from '@nestjs/common';
import {UsersService} from "../users/users.service";
import {JwtService} from "@nestjs/jwt";
import {LoginDto} from "./dto/login.dto";
import * as bcrypt from "bcrypt";
import {RegisterDto} from "./dto/register.dto";
import {UsersEntity} from "../users/users.entity";
import {RolesEnum} from "../users/interfaces/roles.enum";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly usersService: UsersService,
  ) {
  }

  public async decode(token: string): Promise<unknown> {
    return this.jwt.decode(token);
  }

  public async validateUser(decoded: any): Promise<UsersEntity> {
    return this.usersService.findById(decoded.id);
  }

  public generateToken(user: UsersEntity): string {
    return this.jwt.sign({ id: user.id, email: user.email} );
  }

  public isPasswordValid(password: string, userPassword: string): boolean {
    return bcrypt.compareSync(password, userPassword);
  }

  public encodePassword(password: string): string {
    const salt: string = bcrypt.genSaltSync(10);

    return bcrypt.hashSync(password, salt);
  }

  // private async validate(token:string): Promise<boolean | never> {
  //   const decoded: unknown = this.jwt.verify(token);
  //
  //   if(!decoded) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  //
  //   const user: UsersEntity = await this.validateUser(decoded);
  //
  //   if (!user) throw new UnauthorizedException()
  //
  //   return true;
  // }

  public async register(registerDto: RegisterDto) {
    const {email, password}: RegisterDto = registerDto;

    let user = await this.usersService.findByEmail(email);

    if (user) {
      throw new HttpException('Conflict', HttpStatus.CONFLICT);
    }
    user = new UsersEntity();

    user.email = email;
    user.password = this.encodePassword(password);
    user.roles = [RolesEnum.Guest]

    return this.usersService.createUser(user);
  }

  public async login(loginDto: LoginDto): Promise<string | never> {
    const { email, password }: LoginDto = loginDto;

    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid email or password');

    const isPasswordMatch:boolean = this.isPasswordValid(
      password,
      user.password,
    );

    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.generateToken(user);
  }

  public async refresh(user: UsersEntity): Promise<string> {
    return this.generateToken(user);
  }
}
