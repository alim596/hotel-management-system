import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

interface JwtUser {
  id: number;
  email: string;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<T = JwtUser>(err: any, user: T | false): T {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
