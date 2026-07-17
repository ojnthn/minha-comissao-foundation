import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AuthController } from './presentation/controllers/auth.controller';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { MeUseCase } from './application/use-cases/me.use-case';
import { PrismaUsuarioRepository } from './infrastructure/repositories/prisma-usuario.repository';
import { USUARIO_REPOSITORY } from './domain/repositories/usuario.repository.interface';
import { JwtTokenService } from '../../shared/jwt/jwt-token.service';
import { PasswordHasherService } from '../../shared/crypto/password-hasher.service';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';

@Module({
  controllers: [AuthController],
  providers: [
    { provide: PrismaClient, useValue: new PrismaClient() },
    LoginUseCase,
    MeUseCase,
    JwtTokenService,
    PasswordHasherService,
    JwtAuthGuard,
    { provide: USUARIO_REPOSITORY, useClass: PrismaUsuarioRepository },
  ],
  exports: [JwtTokenService, JwtAuthGuard],
})
export class AuthModule {}
