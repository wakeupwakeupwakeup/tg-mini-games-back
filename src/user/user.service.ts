import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getBalance(tgId: number) {
    const user = await this.prisma.user.findUnique({ where: { tgId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.balance;
  }

  async getGamesStats(tgId: number) {
    const user = await this.prisma.user.findUnique({ where: { tgId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      totalGames: user.totalGames,
      totalWins: user.totalWins,
    };
  }
}
