import { Inject, Injectable } from '@nestjs/common';
import {
  OrdemListagemPedidos,
  PEDIDO_REPOSITORY,
} from '../../domain/repositories/pedido.repository.interface';
import type { IPedidoRepository } from '../../domain/repositories/pedido.repository.interface';

export interface ListPedidosInput {
  idMarceneiro?: number;
  porUsuario?: boolean;
  idUsuarioLogado: number;
  dataInicio?: Date;
  dataFim?: Date;
  page: number;
  limit: number;
  ordem?: OrdemListagemPedidos;
}

export interface ListPedidosOutput {
  pagination: {
    current: number;
    next: number | null;
  };
  detalhes: Array<{
    id: number;
    codigo: string;
    data: string;
    marceneiro: {
      id: number;
      nome: string;
    };
    vendedor: {
      id: number;
      nome: string;
    };
    valor: {
      total: string;
      comissao: string;
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

function formatData(data: Date): string {
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}/${data.getFullYear()}`;
}

function calcularComissao(
  produtos: Array<{ valorProduto: number; valorPorcentagem: number }>,
): number {
  return produtos.reduce(
    (total, produto) =>
      total + produto.valorProduto * (produto.valorPorcentagem / 100),
    0,
  );
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
      ordem: input.ordem,
    });

    const hasNext = input.page * input.limit < total;

    return {
      pagination: {
        current: input.page,
        next: hasNext ? input.page + 1 : null,
      },
      detalhes: data.map((pedido) => ({
        id: pedido.id,
        codigo: formatCodigo(pedido.id),
        data: formatData(pedido.logDataCadastro),
        marceneiro: {
          id: pedido.idMarceneiro,
          nome: pedido.marceneiroNome,
        },
        vendedor: {
          id: pedido.usuarioCadastro.id,
          nome: pedido.usuarioCadastro.nome,
        },
        valor: {
          total: formatMoeda(pedido.valor),
          comissao: formatMoeda(calcularComissao(pedido.produtos)),
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
