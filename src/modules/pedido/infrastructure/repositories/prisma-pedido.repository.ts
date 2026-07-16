import { Injectable } from '@nestjs/common';
import {
  Pedido as PrismaPedido,
  PedidoProduto as PrismaPedidoProduto,
  Prisma,
  PrismaClient,
} from '@prisma/client';
import { Pedido } from '../../domain/entities/pedido.entity';
import {
  AtualizarPedidoData,
  CriarPedidoData,
  IPedidoRepository,
  ListarPedidosFiltro,
  ListarPedidosResult,
} from '../../domain/repositories/pedido.repository.interface';

type PrismaPedidoComProdutos = PrismaPedido & {
  produtos: PrismaPedidoProduto[];
};

@Injectable()
export class PrismaPedidoRepository implements IPedidoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async criar(data: CriarPedidoData): Promise<Pedido> {
    const raw = await this.prisma.$transaction(async (tx) => {
      const pedidoCriado = await tx.pedido.create({
        data: {
          valor: data.valor,
          idMarceneiro: data.idMarceneiro,
          logIdUsuarioCadastro: data.logIdUsuarioCadastro,
        },
      });

      await tx.pedidoProduto.createMany({
        data: data.produtos.map((produto) => ({
          idPedido: pedidoCriado.id,
          idProduto: produto.idProduto,
          valorProduto: produto.valorProduto,
          valorPorcentagem: produto.valorPorcentagem,
        })),
      });

      return tx.pedido.findUniqueOrThrow({
        where: { id: pedidoCriado.id },
        include: { produtos: true },
      });
    });

    return this.toDomain(raw);
  }

  async atualizar(id: number, data: AtualizarPedidoData): Promise<Pedido> {
    const raw = await this.prisma.$transaction(async (tx) => {
      await tx.pedido.update({
        where: { id },
        data: {
          valor: data.valor,
          idMarceneiro: data.idMarceneiro,
        },
      });

      if (data.produtos) {
        await tx.pedidoProduto.deleteMany({ where: { idPedido: id } });
        await tx.pedidoProduto.createMany({
          data: data.produtos.map((produto) => ({
            idPedido: id,
            idProduto: produto.idProduto,
            valorProduto: produto.valorProduto,
            valorPorcentagem: produto.valorPorcentagem,
          })),
        });
      }

      return tx.pedido.findUniqueOrThrow({
        where: { id },
        include: { produtos: true },
      });
    });

    return this.toDomain(raw);
  }

  async excluir(id: number, idUsuarioExclusao: number): Promise<void> {
    await this.prisma.pedido.update({
      where: { id },
      data: {
        logDataExclusao: new Date(),
        logIdUsuarioExclusao: idUsuarioExclusao,
      },
    });
  }

  async buscarPorId(id: number): Promise<Pedido | null> {
    const raw = await this.prisma.pedido.findUnique({
      where: { id },
      include: { produtos: true },
    });
    return raw ? this.toDomain(raw) : null;
  }

  async listar(filtro: ListarPedidosFiltro): Promise<ListarPedidosResult> {
    const where: Prisma.PedidoWhereInput = {
      logDataExclusao: null,
      ...(filtro.idMarceneiro ? { idMarceneiro: filtro.idMarceneiro } : {}),
      ...(filtro.idUsuarioCadastro
        ? { logIdUsuarioCadastro: filtro.idUsuarioCadastro }
        : {}),
      ...(filtro.dataInicio || filtro.dataFim
        ? {
            logDataCadastro: {
              ...(filtro.dataInicio ? { gte: filtro.dataInicio } : {}),
              ...(filtro.dataFim ? { lte: filtro.dataFim } : {}),
            },
          }
        : {}),
    };

    const [raw, total] = await this.prisma.$transaction([
      this.prisma.pedido.findMany({
        where,
        skip: (filtro.page - 1) * filtro.limit,
        take: filtro.limit,
        orderBy: { id: 'asc' },
        include: {
          marceneiro: true,
          usuarioCadastro: true,
          produtos: { include: { produto: true } },
        },
      }),
      this.prisma.pedido.count({ where }),
    ]);

    return {
      total,
      data: raw.map((pedido) => ({
        id: pedido.id,
        valor: pedido.valor,
        idMarceneiro: pedido.idMarceneiro,
        marceneiroNome: pedido.marceneiro.nome,
        usuarioCadastro: {
          id: pedido.usuarioCadastro.id,
          nome: pedido.usuarioCadastro.nome,
        },
        produtos: pedido.produtos.map((item) => ({
          id: item.produto.id,
          nome: item.produto.nome,
          valorProduto: item.valorProduto,
          valorPorcentagem: item.valorPorcentagem,
        })),
      })),
    };
  }

  async marceneiroAtivoExiste(id: number): Promise<boolean> {
    const marceneiro = await this.prisma.marceneiro.findFirst({
      where: { id, logDataExclusao: null },
      select: { id: true },
    });
    return marceneiro !== null;
  }

  async produtosAtivosExistentes(ids: number[]): Promise<number[]> {
    if (ids.length === 0) {
      return [];
    }
    const produtos = await this.prisma.produto.findMany({
      where: { id: { in: ids }, logDataExclusao: null },
      select: { id: true },
    });
    return produtos.map((produto) => produto.id);
  }

  private toDomain(raw: PrismaPedidoComProdutos): Pedido {
    const result = Pedido.create({
      id: raw.id,
      valor: raw.valor,
      idMarceneiro: raw.idMarceneiro,
      produtos: raw.produtos.map((item) => ({
        idProduto: item.idProduto,
        valorProduto: item.valorProduto,
        valorPorcentagem: item.valorPorcentagem,
      })),
      logDataCadastro: raw.logDataCadastro,
      logIdUsuarioCadastro: raw.logIdUsuarioCadastro,
      logDataExclusao: raw.logDataExclusao,
      logIdUsuarioExclusao: raw.logIdUsuarioExclusao,
    });
    if (!result.ok) {
      throw new Error(
        `Inconsistência no banco: ${result.error} (id=${raw.id})`,
      );
    }
    return result.value;
  }
}
