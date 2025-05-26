import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from './schemas/user.entity';

interface RequestWithUser extends Request {
  user: {
    id: number;
    email: string;
  };
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(
    @Request() req: RequestWithUser,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.usersService.findById(req.user.id);
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
