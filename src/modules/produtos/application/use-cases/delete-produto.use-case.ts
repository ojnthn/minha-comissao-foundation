import { Inject, Injectable } from '@nestjs/common';
import { NotFoundException } from '../../../../shared/exceptions/domain.exception';
import { PRODUTO_REPOSITORY } from '../../domain/repositories/produto.repository.interface';
import type { IProdutoRepository } from '../../domain/repositories/produto.repository.interface';

export interface DeleteProdutoInput {
  id: number;
  idUsuarioExclusao: number;
}

@Injectable()
export class DeleteProdutoUseCase {
  constructor(
    @Inject(PRODUTO_REPOSITORY)
    private readonly produtoRepository: IProdutoRepository,
  ) {}

  async execute(input: DeleteProdutoInput): Promise<void> {
    const existente = await this.produtoRepository.findById(input.id);
    if (!existente || existente.isExcluido()) {
      throw new NotFoundException('Produto não encontrado');
    }

    await this.produtoRepository.softDelete(input.id, input.idUsuarioExclusao);
  }
}
