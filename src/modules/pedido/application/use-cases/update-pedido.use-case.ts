import { Inject, Injectable } from '@nestjs/common';
import {
  BadRequestException,
  NotFoundException,
} from '../../../../shared/exceptions/domain.exception';
import { PEDIDO_REPOSITORY } from '../../domain/repositories/pedido.repository.interface';
import type {
  IPedidoRepository,
  PedidoProdutoInput,
} from '../../domain/repositories/pedido.repository.interface';

export interface UpdatePedidoInput {
  id: number;
  valor?: number;
  idMarceneiro?: number;
  produtos?: PedidoProdutoInput[];
}

export interface UpdatePedidoOutput {
  valor: number;
  idMarceneiro: number;
  produtos: number[];
}

@Injectable()
export class UpdatePedidoUseCase {
  constructor(
    @Inject(PEDIDO_REPOSITORY)
    private readonly pedidoRepository: IPedidoRepository,
  ) {}

  async execute(input: UpdatePedidoInput): Promise<UpdatePedidoOutput> {
    const existente = await this.pedidoRepository.buscarPorId(input.id);
    if (!existente || existente.isExcluido()) {
      throw new NotFoundException('Pedido não encontrado');
    }

    if (input.idMarceneiro !== undefined) {
      const marceneiroValido =
        await this.pedidoRepository.marceneiroAtivoExiste(input.idMarceneiro);
      if (!marceneiroValido) {
        throw new BadRequestException('Marceneiro inexistente');
      }
    }

    if (input.produtos !== undefined) {
      const idsProduto = input.produtos.map((produto) => produto.idProduto);
      const idsAtivos =
        await this.pedidoRepository.produtosAtivosExistentes(idsProduto);
      const idsInvalidos = idsProduto.filter((id) => !idsAtivos.includes(id));
      if (idsInvalidos.length > 0) {
        throw new BadRequestException(
          `Produto(s) inexistente(s) ou excluído(s): ${idsInvalidos.join(', ')}`,
        );
      }
    }

    const pedido = await this.pedidoRepository.atualizar(input.id, {
      valor: input.valor,
      idMarceneiro: input.idMarceneiro,
      produtos: input.produtos,
    });

    return {
      valor: pedido.valor,
      idMarceneiro: pedido.idMarceneiro,
      produtos: pedido.produtos.map((produto) => produto.idProduto),
    };
  }
}
