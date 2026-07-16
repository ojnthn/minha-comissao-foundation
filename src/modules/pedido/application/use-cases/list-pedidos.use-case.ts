import { Inject, Injectable } from '@nestjs/common';
import { PEDIDO_REPOSITORY } from '../../domain/repositories/pedido.repository.interface';
import type { IPedidoRepository } from '../../domain/repositories/pedido.repository.interface';

export interface ListPedidosInput {
  idMarceneiro?: number;
  porUsuario?: boolean;
  idUsuarioLogado: number;
  dataInicio?: Date;
  dataFim?: Date;
  page: number;
  limit: number;
}

export interface ListPedidosOutput {
  pagination: {
    current: number;
    next: number;
    total: number;
  };
  data: Array<{
    id: number;
    codigo: string;
    valor: string;
    marceneiro: {
      id: number;
      nome: string;
    };
    usuarioCadastro: {
      id: number;
      nome: string;
    };
    produtos: Array<{
      id: number;
      nome: string;
      valor: string;
      porcentagem: string;
    }>;
  }>;
}

const formatador = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function formatMoeda(valor: number): string {
  return formatador.format(valor);
}

function formatCodigo(id: number): string {
  return `#${String(id).padStart(5, '0')}`;
}

@Injectable()
export class ListPedidosUseCase {
  constructor(
    @Inject(PEDIDO_REPOSITORY)
    private readonly pedidoRepository: IPedidoRepository,
  ) {}

  async execute(input: ListPedidosInput): Promise<ListPedidosOutput> {
    const { data, total } = await this.pedidoRepository.listar({
      idMarceneiro: input.idMarceneiro,
      idUsuarioCadastro: input.porUsuario ? input.idUsuarioLogado : undefined,
      dataInicio: input.dataInicio,
      dataFim: input.dataFim,
      page: input.page,
      limit: input.limit,
    });

    const hasNext = input.page * input.limit < total;

    return {
      pagination: {
        current: input.page,
        next: hasNext ? input.page + 1 : input.page,
        total,
      },
      data: data.map((pedido) => ({
        id: pedido.id,
        codigo: formatCodigo(pedido.id),
        valor: formatMoeda(pedido.valor),
        marceneiro: {
          id: pedido.idMarceneiro,
          nome: pedido.marceneiroNome,
        },
        usuarioCadastro: {
          id: pedido.usuarioCadastro.id,
          nome: pedido.usuarioCadastro.nome,
        },
        produtos: pedido.produtos.map((produto) => ({
          id: produto.id,
          nome: produto.nome,
          valor: formatMoeda(produto.valorProduto),
          porcentagem: `${produto.valorPorcentagem}%`,
        })),
      })),
    };
  }
}
