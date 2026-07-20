import { ComissaoPorcentagem } from '../../domain/entities/comissao-porcentagem.entity';
import { IComissaoPorcentagemRepository } from '../../domain/repositories/comissao-porcentagem.repository.interface';
import { ListComissaoPorcentagemUseCase } from './list-comissao-porcentagem.use-case';

describe('ListComissaoPorcentagemUseCase', () => {
  let comissaoPorcentagemRepository: jest.Mocked<IComissaoPorcentagemRepository>;
  let useCase: ListComissaoPorcentagemUseCase;

  function criarComissao(id: number, nome: string, valor: number): ComissaoPorcentagem {
    const result = ComissaoPorcentagem.create({ id, nome, valor });
    if (!result.ok) {
      throw new Error('Fixture inválida');
    }
    return result.value;
  }

  beforeEach(() => {
    comissaoPorcentagemRepository = { findAll: jest.fn() };
    useCase = new ListComissaoPorcentagemUseCase(comissaoPorcentagemRepository);
  });

  it('retorna detalhes mapeando nome para descricao, incluindo o valor numérico, e pagination sem próxima página', async () => {
    comissaoPorcentagemRepository.findAll.mockResolvedValue({
      comissoes: [criarComissao(1, '7%', 7), criarComissao(2, '2%', 2)],
      hasNext: false,
    });

    const result = await useCase.execute({ page: 1, limit: 10 });

    expect(result).toEqual({
      pagination: { current: 1, next: null },
      detalhes: [
        { id: 1, descricao: '7%', valor: 7 },
        { id: 2, descricao: '2%', valor: 2 },
      ],
    });
  });

  it('retorna a próxima página quando houver mais resultados', async () => {
    comissaoPorcentagemRepository.findAll.mockResolvedValue({
      comissoes: [criarComissao(1, '7%', 7)],
      hasNext: true,
    });

    const result = await useCase.execute({ page: 1, limit: 1 });

    expect(result.pagination).toEqual({ current: 1, next: 2 });
  });
});
