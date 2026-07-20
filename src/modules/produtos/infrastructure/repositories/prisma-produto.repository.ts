import { Injectable } from '@nestjs/common';
import { PrismaClient, Produto as PrismaProduto } from '@prisma/client';
import { Produto } from '../../domain/entities/produto.entity';
import {
  CreateProdutoData,
  FindAllProdutosResult,
  IProdutoRepository,
  UpdateProdutoData,
} from '../../domain/repositories/produto.repository.interface';

@Injectable()
export class PrismaProdutoRepository implements IProdutoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateProdutoData): Promise<Produto> {
    const raw = await this.prisma.produto.create({
      data: {
        nome: data.nome,
        valorPorM2: data.valorPorM2,
        idComissaoPorcentagemPadrao: data.idComissaoPorcentagemPadrao,
        logIdUsuarioCadastro: data.logIdUsuarioCadastro,
      },
    });
    return this.toDomain(raw);
  }

  async update(id: number, data: UpdateProdutoData): Promise<Produto> {
    const raw = await this.prisma.produto.update({
      where: { id },
      data: {
        nome: data.nome,
        valorPorM2: data.valorPorM2,
        idComissaoPorcentagemPadrao: data.idComissaoPorcentagemPadrao,
      },
    });
    return this.toDomain(raw);
  }

  async softDelete(id: number, idUsuarioExclusao: number): Promise<void> {
    await this.prisma.produto.update({
      where: { id },
      data: {
        logDataExclusao: new Date(),
        logIdUsuarioExclusao: idUsuarioExclusao,
      },
    });
  }

  async findById(id: number): Promise<Produto | null> {
    const raw = await this.prisma.produto.findUnique({ where: { id } });
    return raw ? this.toDomain(raw) : null;
  }

  async findAll(page: number, limit: number): Promise<FindAllProdutosResult> {
    const raw = await this.prisma.produto.findMany({
      where: { logDataExclusao: null },
      skip: (page - 1) * limit,
      take: limit + 1,
      orderBy: { id: 'asc' },
    });

    const hasNext = raw.length > limit;
    const produtos = raw.slice(0, limit).map((item) => this.toDomain(item));

    return { produtos, hasNext };
  }

  async findByNome(
    nome: string,
    page: number,
    limit: number,
  ): Promise<FindAllProdutosResult> {
    const raw = await this.prisma.produto.findMany({
      where: {
        logDataExclusao: null,
        nome: { contains: nome },
      },
      skip: (page - 1) * limit,
      take: limit + 1,
      orderBy: { id: 'asc' },
    });

    const hasNext = raw.length > limit;
    const produtos = raw.slice(0, limit).map((item) => this.toDomain(item));

    return { produtos, hasNext };
  }

  private toDomain(raw: PrismaProduto): Produto {
    const result = Produto.create({
      id: raw.id,
      nome: raw.nome,
      valorPorM2: raw.valorPorM2,
      idComissaoPorcentagemPadrao: raw.idComissaoPorcentagemPadrao,
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
