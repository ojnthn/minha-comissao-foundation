import { Inject, Injectable } from '@nestjs/common';
import { NotFoundException } from '../../../../shared/exceptions/domain.exception';
import { PEDIDO_REPOSITORY } from '../../domain/repositories/pedido.repository.interface';
import type { IPedidoRepository } from '../../domain/repositories/pedido.repository.interface';

export interface DeletePedidoInput {
  id: number;
  idUsuarioExclusao: number;
}

@Injectable()
export class DeletePedidoUseCase {
  constructor(
    @Inject(PEDIDO_REPOSITORY)
    private readonly pedidoRepository: IPedidoRepository,
  ) {}

  async execute(input: DeletePedidoInput): Promise<void> {
    const existente = await this.pedidoRepository.buscarPorId(input.id);
    if (!existente || existente.isExcluido()) {
      throw new NotFoundException('Pedido não encontrado');
    }

    await this.pedidoRepository.excluir(input.id, input.idUsuarioExclusao);
  }
}
