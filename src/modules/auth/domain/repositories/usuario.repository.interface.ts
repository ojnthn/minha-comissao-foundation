import { Usuario } from '../entities/usuario.entity';

export const USUARIO_REPOSITORY = 'USUARIO_REPOSITORY';

export interface IUsuarioRepository {
  findByEmail(email: string): Promise<Usuario | null>;
  findById(id: number): Promise<Usuario | null>;
}
