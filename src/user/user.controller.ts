import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { FastifyRequest } from 'fastify';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/balance')
  async getBalance(@Req() req: FastifyRequest) {
    return this.userService.getBalance(req.user.tgId);
  }
}
