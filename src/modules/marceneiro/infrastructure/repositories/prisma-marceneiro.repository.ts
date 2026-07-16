import { Injectable } from '@nestjs/common';
import { PrismaClient, Marceneiro as PrismaMarceneiro } from '@prisma/client';
import { Marceneiro } from '../../domain/entities/marceneiro.entity';
import {
  CreateMarceneiroData,
  FindAllMarceneirosResult,
  IMarceneiroRepository,
  UpdateMarceneiroData,
} from '../../domain/repositories/marceneiro.repository.interface';

@Injectable()
export class PrismaMarceneiroRepository implements IMarceneiroRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateMarceneiroData): Promise<Marceneiro> {
    const raw = await this.prisma.marceneiro.create({
      data: {
        nome: data.nome,
        logIdUsuarioCadastro: data.logIdUsuarioCadastro,
      },
    });
    return this.toDomain(raw);
  }

  async update(id: number, data: UpdateMarceneiroData): Promise<Marceneiro> {
    const raw = await this.prisma.marceneiro.update({
      where: { id },
      data: {
        nome: data.nome,
      },
    });
    return this.toDomain(raw);
  }

  async softDelete(id: number, idUsuarioExclusao: number): Promise<void> {
    await this.prisma.marceneiro.update({
      where: { id },
      data: {
        logDataExclusao: new Date(),
        logIdUsuarioExclusao: idUsuarioExclusao,
      },
    });
  }

  async findById(id: number): Promise<Marceneiro | null> {
    const raw = await this.prisma.marceneiro.findUnique({ where: { id } });
    return raw ? this.toDomain(raw) : null;
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<FindAllMarceneirosResult> {
    const raw = await this.prisma.marceneiro.findMany({
      where: { logDataExclusao: null },
      skip: (page - 1) * limit,
      take: limit + 1,
      orderBy: { id: 'asc' },
    });

    const hasNext = raw.length > limit;
    const marceneiros = raw.slice(0, limit).map((item) => this.toDomain(item));

    return { marceneiros, hasNext };
  }

  async findByNome(
    nome: string,
    page: number,
    limit: number,
  ): Promise<FindAllMarceneirosResult> {
    const raw = await this.prisma.marceneiro.findMany({
      where: {
        logDataExclusao: null,
        nome: { contains: nome },
      },
      skip: (page - 1) * limit,
      take: limit + 1,
      orderBy: { id: 'asc' },
    });

    const hasNext = raw.length > limit;
    const marceneiros = raw.slice(0, limit).map((item) => this.toDomain(item));

    return { marceneiros, hasNext };
  }

  private toDomain(raw: PrismaMarceneiro): Marceneiro {
    const result = Marceneiro.create({
      id: raw.id,
      nome: raw.nome,
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
