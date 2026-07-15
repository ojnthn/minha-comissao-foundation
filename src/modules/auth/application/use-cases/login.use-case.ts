import { Inject, Injectable } from '@nestjs/common';
import { UnauthorizedException } from '../../../../shared/exceptions/domain.exception';
import { PasswordHasherService } from '../../../../shared/crypto/password-hasher.service';
import { JwtTokenService } from '../../../../shared/jwt/jwt-token.service';
import { USUARIO_REPOSITORY } from '../../domain/repositories/usuario.repository.interface';
import type { IUsuarioRepository } from '../../domain/repositories/usuario.repository.interface';

export interface LoginInput {
  email: string;
  senha: string;
}

export interface LoginOutput {
  token: string;
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly passwordHasher: PasswordHasherService,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const usuario = await this.usuarioRepository.findByEmail(input.email);
    if (!usuario) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const senhaValida = await this.passwordHasher.compare(
      input.senha,
      usuario.senha,
    );
    if (!senhaValida) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const token = this.jwtTokenService.generate({ sub: usuario.id });
    return { token };
  }
}
