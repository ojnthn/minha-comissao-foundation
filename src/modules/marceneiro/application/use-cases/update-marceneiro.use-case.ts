import { Inject, Injectable } from '@nestjs/common';
import { NotFoundException } from '../../../../shared/exceptions/domain.exception';
import { MARCENEIRO_REPOSITORY } from '../../domain/repositories/marceneiro.repository.interface';
import type { IMarceneiroRepository } from '../../domain/repositories/marceneiro.repository.interface';

export interface UpdateMarceneiroInput {
  id: number;
  nome?: string;
  telefone?: string;
}

export interface UpdateMarceneiroOutput {
  id: number;
  nome: string;
  telefone: string | null;
}

@Injectable()
export class UpdateMarceneiroUseCase {
  constructor(
    @Inject(MARCENEIRO_REPOSITORY)
    private readonly marceneiroRepository: IMarceneiroRepository,
  ) {}

  async execute(input: UpdateMarceneiroInput): Promise<UpdateMarceneiroOutput> {
    const existente = await this.marceneiroRepository.findById(input.id);
    if (!existente || existente.isExcluido()) {
      throw new NotFoundException('Marceneiro não encontrado');
    }

    const marceneiro = await this.marceneiroRepository.update(input.id, {
      nome: input.nome,
      telefone: input.telefone,
    });

    return {
      id: marceneiro.id,
      nome: marceneiro.nome,
      telefone: marceneiro.telefone,
    };
  }
}
