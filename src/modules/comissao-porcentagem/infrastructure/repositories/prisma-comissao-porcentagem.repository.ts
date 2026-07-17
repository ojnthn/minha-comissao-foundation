import { Injectable } from '@nestjs/common';
import {
  ComissaoPorcentagem as PrismaComissaoPorcentagem,
  PrismaClient,
} from '@prisma/client';
import { ComissaoPorcentagem } from '../../domain/entities/comissao-porcentagem.entity';
import {
  FindAllComissaoPorcentagemResult,
  IComissaoPorcentagemRepository,
} from '../../domain/repositories/comissao-porcentagem.repository.interface';

@Injectable()
export class PrismaComissaoPorcentagemRepository implements IComissaoPorcentagemRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(
    page: number,
    limit: number,
  ): Promise<FindAllComissaoPorcentagemResult> {
    const raw = await this.prisma.comissaoPorcentagem.findMany({
      skip: (page - 1) * limit,
      take: limit + 1,
      orderBy: { id: 'asc' },
    });

    const hasNext = raw.length > limit;
    const comissoes = raw.slice(0, limit).map((item) => this.toDomain(item));

    return { comissoes, hasNext };
  }

  private toDomain(raw: PrismaComissaoPorcentagem): ComissaoPorcentagem {
    const result = ComissaoPorcentagem.create({
      id: raw.id,
      nome: raw.nome,
      valor: raw.valor,
    });
    if (!result.ok) {
      throw new Error(
        `Inconsistência no banco: ${result.error} (id=${raw.id})`,
      );
    }
    return result.value;
  }
}
