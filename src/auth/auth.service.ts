import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { isValid, parse } from '@telegram-apps/init-data-node';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './auth.guard';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async authenticate(initData: string) {
    const isInitDataValid = isValid(
      initData,
      this.configService.get('BOT_TOKEN') as string,
    );

    if (!isInitDataValid && process.env.NODE_ENV !== 'development') {
      throw new BadRequestException('Invalid init data');
    }

    const userData = parse(initData).user;

    if (!userData) {
      throw new BadRequestException('Invalid init data');
    }

    const { id: tgId, username } = userData;

    if (!tgId || !username) {
      throw new BadRequestException('Invalid init data');
    }

    let user = await this.prisma.user.findUnique({ where: { tgId } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          tgId,
          username,
          balance: Number(this.configService.get('INIT_USER_BALANCE') ?? 100),
        },
      });
    }

    const payload: JwtPayload = {
      id: user.id,
      username: user.username,
      tgId: user.tgId,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload, {
        secret: this.configService.get('BOT_TOKEN') as string,
      }),
      refreshToken: await this.jwtService.signAsync(payload, {
        secret: this.configService.get('BOT_TOKEN') as string,
        expiresIn: '7d',
      }),
    };
  }
}
