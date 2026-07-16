import { Inject, Injectable } from '@nestjs/common';
import { BadRequestException } from '../../../../shared/exceptions/domain.exception';
import { PEDIDO_REPOSITORY } from '../../domain/repositories/pedido.repository.interface';
import type {
  IPedidoRepository,
  PedidoProdutoInput,
} from '../../domain/repositories/pedido.repository.interface';

export interface CreatePedidoInput {
  valor: number;
  idMarceneiro: number;
  produtos: PedidoProdutoInput[];
  idUsuarioCadastro: number;
}

export interface CreatePedidoOutput {
  id: number;
  valor: number;
  idMarceneiro: number;
  produtos: number[];
}

@Injectable()
export class CreatePedidoUseCase {
  constructor(
    @Inject(PEDIDO_REPOSITORY)
    private readonly pedidoRepository: IPedidoRepository,
  ) {}

  async execute(input: CreatePedidoInput): Promise<CreatePedidoOutput> {
    const marceneiroValido = await this.pedidoRepository.marceneiroAtivoExiste(
      input.idMarceneiro,
    );
    if (!marceneiroValido) {
      throw new BadRequestException('Marceneiro inexistente');
    }

    const idsProduto = input.produtos.map((produto) => produto.idProduto);
    const idsAtivos =
      await this.pedidoRepository.produtosAtivosExistentes(idsProduto);
    const idsInvalidos = idsProduto.filter((id) => !idsAtivos.includes(id));
    if (idsInvalidos.length > 0) {
      throw new BadRequestException(
        `Produto(s) inexistente(s) ou excluído(s): ${idsInvalidos.join(', ')}`,
      );
    }

    const pedido = await this.pedidoRepository.criar({
      valor: input.valor,
      idMarceneiro: input.idMarceneiro,
      logIdUsuarioCadastro: input.idUsuarioCadastro,
      produtos: input.produtos,
    });

    return {
      id: pedido.id,
      valor: pedido.valor,
      idMarceneiro: pedido.idMarceneiro,
      produtos: pedido.produtos.map((produto) => produto.idProduto),
    };
  }
}
