import { Marceneiro } from '../entities/marceneiro.entity';

export const MARCENEIRO_REPOSITORY = 'MARCENEIRO_REPOSITORY';

export interface FindAllMarceneirosResult {
  marceneiros: Marceneiro[];
  hasNext: boolean;
}

export interface CreateMarceneiroData {
  nome: string;
  logIdUsuarioCadastro: number;
}

export interface UpdateMarceneiroData {
  nome?: string;
}

export interface IMarceneiroRepository {
  create(data: CreateMarceneiroData): Promise<Marceneiro>;
  update(id: number, data: UpdateMarceneiroData): Promise<Marceneiro>;
  softDelete(id: number, idUsuarioExclusao: number): Promise<void>;
  findById(id: number): Promise<Marceneiro | null>;
  findAll(page: number, limit: number): Promise<FindAllMarceneirosResult>;
  findByNome(
    nome: string,
    page: number,
    limit: number,
  ): Promise<FindAllMarceneirosResult>;
}
