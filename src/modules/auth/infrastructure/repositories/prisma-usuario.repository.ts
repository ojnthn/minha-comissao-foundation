import { Injectable } from '@nestjs/common';
import { PrismaClient, Usuario as PrismaUsuario } from '@prisma/client';
import { Usuario } from '../../domain/entities/usuario.entity';
import { IUsuarioRepository } from '../../domain/repositories/usuario.repository.interface';

@Injectable()
export class PrismaUsuarioRepository implements IUsuarioRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<Usuario | null> {
    const raw = await this.prisma.usuario.findUnique({ where: { email } });
    return raw ? this.toDomain(raw) : null;
  }

  private toDomain(raw: PrismaUsuario): Usuario {
    const result = Usuario.create({
      id: raw.id,
      nome: raw.nome,
      email: raw.email,
      senha: raw.senha,
    });
    if (!result.ok) {
      throw new Error(
        `Inconsistência no banco: ${result.error} (id=${raw.id})`,
      );
    }
    return result.value;
  }
}
