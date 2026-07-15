# CONTEXT — Produtos

## Responsabilidade

`ProdutosModule` gerencia o cadastro de produtos (chapas de MDF) vendidos pelos representantes: criação, edição, consulta e remoção (soft delete).

> SRP: este módulo tem exatamente uma razão para mudar — regras de cadastro de produto.

---

## Escopo

### Dentro do escopo

- CRUD de produto (criar, listar, buscar por ID, atualizar, remover)
- Vincular produto a uma `ComissaoPorcentagem` padrão (`idComissaoPorcentagemPadrao`)
- Soft delete via `logDataExclusao`/`logIdUsuarioExclusao`

### Fora do escopo

- Cálculo de comissão de pedidos (pertence ao módulo de pedidos, ainda não implementado)
- CRUD de `ComissaoPorcentagem` (módulo próprio, ainda não implementado)
- Autenticação/autorização (não há módulo `auth` ainda — ver "Decisões Técnicas")

---

## Casos de Uso

| Use Case | Arquivo | Rota |
|---|---|---|
| `CreateProdutoUseCase` | `application/use-cases/create-produto.use-case.ts` | `POST /produtos` |
| `GetProdutoUseCase` | `application/use-cases/get-produto.use-case.ts` | `GET /produtos/:id` |
| `ListProdutosUseCase` | `application/use-cases/list-produtos.use-case.ts` | `GET /produtos` |
| `UpdateProdutoUseCase` | `application/use-cases/update-produto.use-case.ts` | `PATCH /produtos/:id` |
| `DeleteProdutoUseCase` | `application/use-cases/delete-produto.use-case.ts` | `DELETE /produtos/:id` |

---

## Entidades de Domínio

### Produto

| Campo | Tipo | Invariante |
|---|---|---|
| `id` | `number` | Gerado pelo banco (auto-incremento); imutável |
| `nome` | `string` | Obrigatório, não vazio |
| `idComissaoPorcentagemPadrao` | `number` | Obrigatório, inteiro positivo (FK para `ComissaoPorcentagem`) |
| `logDataCadastro` | `Date` | Definido na criação; imutável |
| `logIdUsuarioCadastro` | `number` | Usuário que cadastrou; imutável |
| `logDataExclusao` | `Date \| null` | `null` enquanto ativo; preenchido no soft delete |
| `logIdUsuarioExclusao` | `number \| null` | Usuário que excluiu; preenchido no soft delete |

> Entidade usa constructor privado + factory `create()` que retorna `Result<T>`.

## Value Objects

Não se aplica — campos do produto não têm validação de formato própria além de obrigatoriedade, coberta na entidade.

---

## Interface do Repositório

```typescript
// domain/repositories/produto.repository.interface.ts

export const PRODUTO_REPOSITORY = 'PRODUTO_REPOSITORY';

export interface IProdutoRepository {
  create(data: CreateProdutoData): Promise<Produto>;
  update(id: number, data: UpdateProdutoData): Promise<Produto>;
  softDelete(id: number, idUsuarioExclusao: number): Promise<void>;
  findById(id: number): Promise<Produto | null>;
  findAll(page: number, limit: number): Promise<FindAllProdutosResult>;
}
```

---

## Contrato da API

### `POST /produtos`

**Request body:**
```json
{
  "nome": "Chapa MDF Branco 15mm",
  "idComissaoPorcentagemPadrao": 1,
  "idUsuarioCadastro": 1
}
```

**Response (201):**
```json
{ "id": 1, "nome": "Chapa MDF Branco 15mm", "idComissaoPorcentagemPadrao": 1 }
```

### `GET /produtos?page=1&limit=10`

**Response (200):**
```json
{
  "pagination": { "current": 1, "next": 2 },
  "details": [{ "id": 1, "nome": "Chapa MDF Branco 15mm", "idComissaoPorcentagemPadrao": 1 }]
}
```

### `GET /produtos/:id`

**Response (200):**
```json
{ "id": 1, "nome": "Chapa MDF Branco 15mm", "idComissaoPorcentagemPadrao": 1 }
```

### `PATCH /produtos/:id`

**Request body:**
```json
{ "nome": "Chapa MDF Branco 18mm" }
```

**Response (200):** igual ao `GET /produtos/:id`

### `DELETE /produtos/:id`

**Request body:**
```json
{ "idUsuarioExclusao": 1 }
```

**Response (200):** sem corpo relevante

---

## Erros Esperados

| Exceção | Código HTTP | Quando ocorre |
|---|---|---|
| `NotFoundException` | `404` | Produto não existe ou já foi excluído (soft delete) |
| `DomainException` | `422` | Violação genérica de regra de negócio |

---

## Fluxo de Execução

### CreateProdutoUseCase

```
1. Controller recebe CreateProdutoDto → chama CreateProdutoUseCase.execute(input)
2. UseCase chama IProdutoRepository.create()
3. Repositório persiste via Prisma e mapeia para entidade Produto
4. Controller retorna HTTP 201 com o produto criado
```

### GetProdutoUseCase / UpdateProdutoUseCase / DeleteProdutoUseCase

```
1. Controller chama o use case com o :id da rota
2. UseCase busca produto via IProdutoRepository.findById()
3. [Se não existe ou já excluído] → throw NotFoundException → HTTP 404
4. [Se existe] → executa a operação (get/update/delete) e retorna
```

---

## Limites

- Não acessa banco diretamente — apenas via `IProdutoRepository` (DIP)
- Não conhece `PrismaProdutoRepository` (OCP)
- Domain não importa `@nestjs/*`, Prisma, `class-validator` ou qualquer lib externa
- Controller não contém lógica de negócio

---

## Regras Obrigatórias

- Regra de dependência: `presentation → application → domain ← infrastructure`
- Um use case por operação
- Use cases lançam `NotFoundException`/`DomainException` — nunca retornam `null` silenciosamente
- Mapper `toDomain()` isolado em `PrismaProdutoRepository`
- Remoção é sempre soft delete — nunca `DELETE` físico no banco

---

## O que é Proibido

- Importar `@nestjs/*`, Prisma ou libs externas no domínio
- Acessar `PrismaClient` diretamente em use cases ou controllers
- Vazar tipos Prisma (`PrismaProduto`) para fora do repositório
- Excluir fisicamente um produto (usar apenas soft delete)

---

## Dependências Permitidas

| Camada | Pode depender de |
|---|---|
| `domain` | Apenas `shared/types` (`Result<T>`) |
| `application` | `domain/`, `shared/exceptions`, `shared/types` |
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
| Entidade | `domain/entities/produto.entity.ts` | `Produto` |
| Interface repositório | `domain/repositories/produto.repository.interface.ts` | `IProdutoRepository` |
| Token DI | mesmo arquivo da interface | `PRODUTO_REPOSITORY` |
| Use case | `application/use-cases/{acao}-produto.use-case.ts` | `{Acao}ProdutoUseCase` |
| DTO | `application/dtos/{nome}.dto.ts` | `{Nome}Dto` |
| Repositório Prisma | `infrastructure/repositories/prisma-produto.repository.ts` | `PrismaProdutoRepository` |
| Controller | `presentation/controllers/produtos.controller.ts` | `ProdutosController` |

---

## Relação com Outros Componentes

| Componente | Relação |
|---|---|
| `shared/exceptions/domain.exception` | Use cases lançam `NotFoundException` |
| `shared/types/result` | `Produto.create()` retorna `Result<Produto>` |
| `ComissaoPorcentagem` (Prisma) | `idComissaoPorcentagemPadrao` referencia esse model — módulo próprio ainda não implementado |
| `Pedido` (Prisma) | Consome `Produto` — módulo próprio ainda não implementado |

---

## Decisões Técnicas

- **Sem `@CurrentUser()`/JWT**: não há módulo `auth` implementado ainda. `idUsuarioCadastro`/`idUsuarioExclusao` são recebidos explicitamente no body até o módulo de autenticação existir — trocar por `@CurrentUser()` quando `auth` for implementado.
- **Rota em português (`/produtos`)**: a spec original (`docs/specs/movie-review-spec.md`) usava `product/` (resquício de template em inglês); adotado português para consistência com o schema Prisma (`Usuario`, `Produto`, `Pedido`) e com o domínio do projeto.
- **Resposta de listagem com `pagination`/`details`**: formato herdado da spec original, mas com campos reais do domínio (`id`, `idComissaoPorcentagemPadrao`) em vez do exemplo informal da spec.

---

## Evolução Futura

- Trocar `idUsuarioCadastro`/`idUsuarioExclusao` explícitos por `@CurrentUser()` quando o módulo `auth` existir
- Adicionar módulo `comissoes` para CRUD de `ComissaoPorcentagem`
- Adicionar módulo `pedidos` que referencia `Produto`

---

## O que NÃO Fazer Neste Módulo

- Não implementar lógica de pedidos ou comissão de venda aqui
- Não fazer `DELETE` físico — sempre soft delete
- Não acessar `PrismaClient` fora de `infrastructure/repositories/`
