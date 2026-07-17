# CONTEXT — Comissão Porcentagem

## Responsabilidade

`ComissaoPorcentagemModule` expõe a listagem dos percentuais de comissão cadastrados (`ComissaoPorcentagem`), consumidos pelo frontend para exibir opções de comissão (ex: ao vincular um produto a uma comissão padrão).

> SRP: este módulo tem exatamente uma razão para mudar — leitura de percentuais de comissão.

---

## Escopo

### Dentro do escopo

- Listar percentuais de comissão cadastrados, paginado

### Fora do escopo

- CRUD (criar/editar/excluir) de `ComissaoPorcentagem` — cadastro é feito via phpMyAdmin, conforme `CLAUDE.md` raiz (stack de administração DB)
- Cálculo de comissão de pedidos (módulo `pedido`)
- Vínculo de produto a uma comissão padrão (módulo `produtos`)

---

## Casos de Uso

| Use Case | Arquivo | Rota |
|---|---|---|
| `ListComissaoPorcentagemUseCase` | `application/use-cases/list-comissao-porcentagem.use-case.ts` | `GET /comissao-porcentagem` |

---

## Entidades de Domínio

### ComissaoPorcentagem

| Campo | Tipo | Invariante |
|---|---|---|
| `id` | `number` | Gerado pelo banco (auto-incremento); imutável |
| `nome` | `string` | Obrigatório, não vazio — exposto na API como `descricao` |
| `valor` | `number` | Obrigatório — percentual numérico (ex: `7` para 7%); não exposto na listagem |

> Entidade usa constructor privado + factory `create()` que retorna `Result<T>`.

## Value Objects

Não se aplica — campos não têm validação de formato própria além de obrigatoriedade, coberta na entidade.

---

## Interface do Repositório

```typescript
// domain/repositories/comissao-porcentagem.repository.interface.ts

export const COMISSAO_PORCENTAGEM_REPOSITORY = 'COMISSAO_PORCENTAGEM_REPOSITORY';

export interface IComissaoPorcentagemRepository {
  findAll(page: number, limit: number): Promise<FindAllComissaoPorcentagemResult>;
}
```

---

## Contrato da API

### `GET /comissao-porcentagem?page=1&limit=10`

**Response (200):**
```json
{
  "pagination": { "current": 1, "next": null },
  "detalhes": [
    { "id": 1, "descricao": "7%" },
    { "id": 2, "descricao": "2%" }
  ]
}
```

`descricao` mapeia o campo `nome` da entidade.

---

## Erros Esperados

Nenhum erro específico — rota pública, sem parâmetro de path. `page`/`limit` inválidos são rejeitados pelo `ValidationPipe` global (`400`).

---

## Fluxo de Execução

### ListComissaoPorcentagemUseCase

```
1. Controller recebe ListComissaoPorcentagemQueryDto → chama ListComissaoPorcentagemUseCase.execute(input)
2. UseCase chama IComissaoPorcentagemRepository.findAll()
3. Repositório busca via Prisma e mapeia para entidade ComissaoPorcentagem
4. Controller retorna HTTP 200 com pagination + detalhes (nome → descricao)
```

---

## Limites

- Não acessa banco diretamente — apenas via `IComissaoPorcentagemRepository` (DIP)
- Não conhece `PrismaComissaoPorcentagemRepository` (OCP)
- Domain não importa `@nestjs/*`, Prisma, `class-validator` ou qualquer lib externa
- Controller não contém lógica de negócio

---

## Regras Obrigatórias

- Regra de dependência: `presentation → application → domain ← infrastructure`
- Um use case por operação
- Mapper `toDomain()` isolado em `PrismaComissaoPorcentagemRepository`

---

## O que é Proibido

- Importar `@nestjs/*`, Prisma ou libs externas no domínio
- Acessar `PrismaClient` diretamente em use cases ou controllers
- Vazar tipos Prisma (`PrismaComissaoPorcentagem`) para fora do repositório
- Implementar create/update/delete neste módulo (fora do escopo — ver acima)

---

## Dependências Permitidas

| Camada | Pode depender de |
|---|---|
| `domain` | Apenas `shared/types` (`Result<T>`) |
| `application` | `domain/`, `shared/types` |
| `infrastructure` | `domain/`, `@nestjs/*`, `@prisma/client` |
| `presentation` | `application/dtos`, use cases via DI, `@nestjs/*` |

---

## Dependências Proibidas

| Camada | Proibido |
|---|---|
| `domain` | `@nestjs/*`, Prisma, `class-validator`, libs de terceiros |
| `application` | `@prisma/client`, `PrismaClient` diretamente |
| `presentation` | Repositórios diretamente; lógica de negócio |

---

## Variáveis de Ambiente

Não se aplica — este módulo usa apenas `DATABASE_URL` (já configurado globalmente em `config/database.config.ts`).

---

## Convenções

| Artefato | Arquivo | Classe |
|---|---|---|
| Entidade | `domain/entities/comissao-porcentagem.entity.ts` | `ComissaoPorcentagem` |
| Interface repositório | `domain/repositories/comissao-porcentagem.repository.interface.ts` | `IComissaoPorcentagemRepository` |
| Token DI | mesmo arquivo da interface | `COMISSAO_PORCENTAGEM_REPOSITORY` |
| Use case | `application/use-cases/list-comissao-porcentagem.use-case.ts` | `ListComissaoPorcentagemUseCase` |
| DTO | `application/dtos/list-comissao-porcentagem-query.dto.ts` | `ListComissaoPorcentagemQueryDto` |
| Repositório Prisma | `infrastructure/repositories/prisma-comissao-porcentagem.repository.ts` | `PrismaComissaoPorcentagemRepository` |
| Controller | `presentation/controllers/comissao-porcentagem.controller.ts` | `ComissaoPorcentagemController` |

---

## Relação com Outros Componentes

| Componente | Relação |
|---|---|
| `shared/types/result` | `ComissaoPorcentagem.create()` retorna `Result<ComissaoPorcentagem>` |
| `Produto` (Prisma) | `Produto.idComissaoPorcentagemPadrao` referencia `ComissaoPorcentagem` — relação não consumida por este módulo |
| `produtos` módulo | Consome `ComissaoPorcentagem` via FK, mas não importa este módulo — cada um acessa o Prisma model diretamente |

---

## Decisões Técnicas

- **Chave `pagination` em inglês**: a spec original (`docs/specs/user-data.md`) pedia `paginacao`/`atual`/`proxima` (tudo em português), mas optou-se por manter `pagination`/`current`/`next` para ficar consistente com o envelope já usado em `GET /produtos` e `GET /pedidos` — decisão confirmada com o usuário.
- **`detalhes` (não `details`)**: alinhado com `GET /pedidos`, que já usa a chave em português; `GET /produtos` é a exceção (`details`) e não foi tomada como referência aqui.
- **`descricao` mapeado de `nome`**: a tabela `comissao_porcentagem` armazena a string formatada (ex: `"7%"`) na coluna `nome`; não há coluna `descricao` no schema Prisma.
- **Sem CRUD**: a spec só define a rota `GET`; cadastro de percentuais é manual via phpMyAdmin, conforme a stack documentada no `CLAUDE.md` raiz.

---

## Evolução Futura

- Se for necessário CRUD via API no futuro, criar use cases dedicados (`CreateComissaoPorcentagemUseCase` etc.) mediante nova spec/solicitação explícita.

---

## O que NÃO Fazer Neste Módulo

- Não implementar create/update/delete sem solicitação explícita
- Não acessar `PrismaClient` fora de `infrastructure/repositories/`
- Não expor o campo `valor` na listagem (fora do contrato da spec)
