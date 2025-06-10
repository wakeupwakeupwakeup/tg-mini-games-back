import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [PrismaService, AuthService, JwtService],
  controllers: [AuthController],
})
export class AuthModule {}
