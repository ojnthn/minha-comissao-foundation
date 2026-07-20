import { Inject, Injectable } from '@nestjs/common';
import { MARCENEIRO_REPOSITORY } from '../../domain/repositories/marceneiro.repository.interface';
import type { IMarceneiroRepository } from '../../domain/repositories/marceneiro.repository.interface';

export interface CreateMarceneiroInput {
  nome: string;
  telefone?: string;
  idUsuarioCadastro: number;
}

export interface CreateMarceneiroOutput {
  id: number;
  nome: string;
  telefone: string | null;
}

@Injectable()
export class CreateMarceneiroUseCase {
  constructor(
    @Inject(MARCENEIRO_REPOSITORY)
    private readonly marceneiroRepository: IMarceneiroRepository,
  ) {}

  async execute(input: CreateMarceneiroInput): Promise<CreateMarceneiroOutput> {
    const marceneiro = await this.marceneiroRepository.create({
      nome: input.nome,
      telefone: input.telefone,
      logIdUsuarioCadastro: input.idUsuarioCadastro,
    });

    return {
      id: marceneiro.id,
      nome: marceneiro.nome,
      telefone: marceneiro.telefone,
    };
  }
}
