import { Inject, Injectable } from '@nestjs/common';
import { NotFoundException } from '../../../../shared/exceptions/domain.exception';
import { MARCENEIRO_REPOSITORY } from '../../domain/repositories/marceneiro.repository.interface';
import type { IMarceneiroRepository } from '../../domain/repositories/marceneiro.repository.interface';

export interface DeleteMarceneiroInput {
  id: number;
  idUsuarioExclusao: number;
}

@Injectable()
export class DeleteMarceneiroUseCase {
  constructor(
    @Inject(MARCENEIRO_REPOSITORY)
    private readonly marceneiroRepository: IMarceneiroRepository,
  ) {}

  async execute(input: DeleteMarceneiroInput): Promise<void> {
    const existente = await this.marceneiroRepository.findById(input.id);
    if (!existente || existente.isExcluido()) {
      throw new NotFoundException('Marceneiro não encontrado');
    }

    await this.marceneiroRepository.softDelete(
      input.id,
      input.idUsuarioExclusao,
    );
  }
}
