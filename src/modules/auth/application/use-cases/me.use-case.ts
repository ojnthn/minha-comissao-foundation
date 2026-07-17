import { Inject, Injectable } from '@nestjs/common';
import { UnauthorizedException } from '../../../../shared/exceptions/domain.exception';
import { USUARIO_REPOSITORY } from '../../domain/repositories/usuario.repository.interface';
import type { IUsuarioRepository } from '../../domain/repositories/usuario.repository.interface';

export interface MeInput {
  userId: number;
}

export interface MeOutput {
  nome: string;
  email: string;
}

@Injectable()
export class MeUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: IUsuarioRepository,
  ) {}

  async execute(input: MeInput): Promise<MeOutput> {
    const usuario = await this.usuarioRepository.findById(input.userId);
    if (!usuario) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return { nome: usuario.nome, email: usuario.email };
  }
}
