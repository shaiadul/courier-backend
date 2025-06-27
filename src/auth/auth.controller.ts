import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private userService: UserService) {}

  @Post('register')
  async register(@Body() body) {
    const hashed = await bcrypt.hash(body.password, 10);
    return this.userService.create({ ...body, password: hashed });
  }

  @Post('login')
  async login(@Body() body) {
    const user = await this.authService.validate(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException("Credentials don't match");
    }
    return this.authService.login(user);
  }
}
