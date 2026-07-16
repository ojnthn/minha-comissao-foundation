# CONTEXT — Marceneiro

## Responsabilidade

`MarceneiroModule` gerencia o cadastro de marceneiros (clientes que compram chapas de MDF através dos representantes): criação, edição, consulta (listagem e busca por nome) e remoção (soft delete).

> SRP: este módulo tem exatamente uma razão para mudar — regras de cadastro de marceneiro.

---

## Escopo

### Dentro do escopo

- CRUD de marceneiro (criar, listar, buscar por nome, atualizar, remover)
- Soft delete via `logDataExclusao`/`logIdUsuarioExclusao`
- Proteger `POST /marceneiro` e `DELETE /marceneiro/:id` com `JwtAuthGuard` (módulo `auth`), extraindo o usuário autenticado via `@CurrentUser()` — mesmo padrão do módulo `produtos`

### Fora do escopo

- Vínculo com pedidos (pertence ao módulo de pedidos, ainda não implementado)
- Emissão/validação de JWT (pertence ao módulo `auth`)

---

## Casos de Uso

| Use Case | Arquivo | Rota |
|---|---|---|
| `CreateMarceneiroUseCase` | `application/use-cases/create-marceneiro.use-case.ts` | `POST /marceneiro` |
| `ListMarceneirosUseCase` | `application/use-cases/list-marceneiros.use-case.ts` | `GET /marceneiro` |
| `SearchMarceneirosByNomeUseCase` | `application/use-cases/search-marceneiros-by-nome.use-case.ts` | `GET /marceneiro/:nome` |
| `UpdateMarceneiroUseCase` | `application/use-cases/update-marceneiro.use-case.ts` | `PATCH /marceneiro/:id` |
| `DeleteMarceneiroUseCase` | `application/use-cases/delete-marceneiro.use-case.ts` | `DELETE /marceneiro/:id` |

> Não há `GetMarceneiroUseCase` por ID — a spec não define uma rota de busca por ID, apenas listagem e busca por nome.

---

## Entidades de Domínio

### Marceneiro

| Campo | Tipo | Invariante |
|---|---|---|
| `id` | `number` | Gerado pelo banco (auto-incremento); imutável |
| `nome` | `string` | Obrigatório, não vazio |
| `logDataCadastro` | `Date` | Definido na criação; imutável |
| `logIdUsuarioCadastro` | `number` | Usuário que cadastrou; imutável |
| `logDataExclusao` | `Date \| null` | `null` enquanto ativo; preenchido no soft delete |
| `logIdUsuarioExclusao` | `number \| null` | Usuário que excluiu; preenchido no soft delete |

> Entidade usa constructor privado + factory `create()` que retorna `Result<T>`.

## Value Objects

Não se aplica — único campo de negócio (`nome`) tem apenas validação de obrigatoriedade, coberta na entidade.

---

## Interface do Repositório

```typescript
// domain/repositories/marceneiro.repository.interface.ts

export const MARCENEIRO_REPOSITORY = 'MARCENEIRO_REPOSITORY';

export interface IMarceneiroRepository {
  create(data: CreateMarceneiroData): Promise<Marceneiro>;
  update(id: number, data: UpdateMarceneiroData): Promise<Marceneiro>;
  softDelete(id: number, idUsuarioExclusao: number): Promise<void>;
  findById(id: number): Promise<Marceneiro | null>;
  findAll(page: number, limit: number): Promise<FindAllMarceneirosResult>;
  findByNome(nome: string, page: number, limit: number): Promise<FindAllMarceneirosResult>;
}
```

---

## Contrato da API

### `POST /marceneiro`

**Header:** `Authorization: Bearer <token>` (obrigatório — `JwtAuthGuard`)

**Request body:**
```json
{ "nome": "João da Marcenaria" }
```

`idUsuarioCadastro` não é recebido no body — vem do `id` (claim `sub`) do JWT via `@CurrentUser()`. `id` também não é aceito no body — é gerado pelo banco (auto-incremento), seguindo o mesmo padrão de `Produto`.

**Response (201):**
```json
{ "id": 1, "nome": "João da Marcenaria" }
```

### `GET /marceneiro?page=1&limit=10`

**Response (200):**
```json
{
  "paginacao": { "atual": 1, "proxima": 2 },
  "detalhes": [{ "id": 1, "nome": "João da Marcenaria" }]
}
```

> Quando não há próxima página, `proxima` é igual a `atual` (não `null`) — formato definido pela spec original.

### `GET /marceneiro/:nome?page=1&limit=10`

Busca marceneiros cujo nome contém o texto informado (case-insensitive, `LIKE %nome%`).

**Response (200):** mesmo formato de `GET /marceneiro`.

### `PATCH /marceneiro/:id`

**Request body:**
```json
{ "nome": "Novo Nome" }
```

**Response (200):**
```json
{ "id": 1, "nome": "Novo Nome" }
```

### `DELETE /marceneiro/:id`

**Header:** `Authorization: Bearer <token>` (obrigatório — `JwtAuthGuard`)

Sem corpo — `idUsuarioExclusao` vem do `id` (claim `sub`) do JWT via `@CurrentUser()`.

**Response (200):** sem corpo relevante

---

## Erros Esperados

| Exceção | Código HTTP | Quando ocorre |
|---|---|---|
| `NotFoundException` | `404` | Marceneiro não existe ou já foi excluído (soft delete) — em `update`/`delete` |
| `UnauthorizedException` (via `JwtAuthGuard`) | `401` | `POST /marceneiro` ou `DELETE /marceneiro/:id` chamado sem token válido |

---

## Fluxo de Execução

### CreateMarceneiroUseCase

```
1. Controller recebe CreateMarceneiroDto → chama CreateMarceneiroUseCase.execute(input)
2. UseCase chama IMarceneiroRepository.create()
3. Repositório persiste via Prisma e mapeia para entidade Marceneiro
4. Controller retorna HTTP 201 com o marceneiro criado
```

### UpdateMarceneiroUseCase / DeleteMarceneiroUseCase

```
1. Controller chama o use case com o :id da rota
2. UseCase busca marceneiro via IMarceneiroRepository.findById()
3. [Se não existe ou já excluído] → throw NotFoundException → HTTP 404
4. [Se existe] → executa a operação (update/delete) e retorna
```

### ListMarceneirosUseCase / SearchMarceneirosByNomeUseCase

```
1. Controller chama o use case com page/limit (e nome, na busca)
2. UseCase busca via IMarceneiroRepository.findAll() ou findByNome()
3. Repositório busca limit+1 registros para calcular hasNext
4. UseCase monta paginacao (atual/proxima) e detalhes
```

---

## Limites

- Não acessa banco diretamente — apenas via `IMarceneiroRepository` (DIP)
- Não conhece `PrismaMarceneiroRepository` (OCP)
- Domain não importa `@nestjs/*`, Prisma, `class-validator` ou qualquer lib externa
- Controller não contém lógica de negócio

---

## Regras Obrigatórias

- Regra de dependência: `presentation → application → domain ← infrastructure`
- Um use case por operação
- Use cases lançam `NotFoundException` — nunca retornam `null` silenciosamente
- Mapper `toDomain()` isolado em `PrismaMarceneiroRepository`
- Remoção é sempre soft delete — nunca `DELETE` físico no banco

---

## O que é Proibido

- Importar `@nestjs/*`, Prisma ou libs externas no domínio
- Acessar `PrismaClient` diretamente em use cases ou controllers
- Vazar tipos Prisma (`PrismaMarceneiro`) para fora do repositório
- Excluir fisicamente um marceneiro (usar apenas soft delete)

---

## Dependências Permitidas

| Camada | Pode depender de |
|---|---|
| `domain` | Apenas `shared/types` (`Result<T>`) |
| `application` | `domain/`, `shared/exceptions`, `shared/types` |
| `infrastructure` | `domain/`, `@nestjs/*`, `@prisma/client` |
| `presentation` | `application/dtos`, use cases via DI, `@nestjs/*`, `auth/infrastructure/guards`, `auth/infrastructure/decorators` |

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
| Entidade | `domain/entities/marceneiro.entity.ts` | `Marceneiro` |
| Interface repositório | `domain/repositories/marceneiro.repository.interface.ts` | `IMarceneiroRepository` |
| Token DI | mesmo arquivo da interface | `MARCENEIRO_REPOSITORY` |
| Use case | `application/use-cases/{acao}-marceneiro(s).use-case.ts` | `{Acao}Marceneiro(s)UseCase` |
| DTO | `application/dtos/{nome}.dto.ts` | `{Nome}Dto` |
| Repositório Prisma | `infrastructure/repositories/prisma-marceneiro.repository.ts` | `PrismaMarceneiroRepository` |
| Controller | `presentation/controllers/marceneiro.controller.ts` | `MarceneiroController` |

---

## Relação com Outros Componentes

| Componente | Relação |
|---|---|
| `shared/exceptions/domain.exception` | Use cases lançam `NotFoundException` |
| `shared/types/result` | `Marceneiro.create()` retorna `Result<Marceneiro>` |
| `Pedido` (Prisma) | Consome `Marceneiro` — módulo próprio ainda não implementado |
| `auth` módulo | `MarceneiroModule` importa `AuthModule` para usar `JwtAuthGuard`/`@CurrentUser()` em `create`/`delete` |

---

## Decisões Técnicas

- **`idUsuarioCadastro`/`idUsuarioExclusao` via `@CurrentUser()`**: mesmo racional do módulo `produtos` — evita que o cliente informe um id de usuário arbitrário.
- **Rota singular (`/marceneiro`)**: a spec (`docs/specs/marceneiro.md`) define as rotas explicitamente no singular, diferente de `/produtos` (plural) — mantido conforme a spec.
- **Campos de paginação em português (`paginacao`/`atual`/`proxima`/`detalhes`)**: a spec define esses nomes literalmente, diferente do módulo `produtos` (que usa `pagination`/`current`/`next`/`details`). Seguido conforme a spec — documentação prevalece sobre convenção de outro módulo.
- **`proxima` igual a `atual` quando não há próxima página**: comportamento explícito da spec (`"proxima": 2 (caso for igual a atual significa que finaliza os registros)"`) — diferente de `produtos`, que usa `next: null`.
- **Sem rota `GET /marceneiro/:id`**: a spec não define busca por ID, apenas listagem (`GET /marceneiro`) e busca por nome (`GET /marceneiro/:nome`). `update`/`delete` continuam buscando por ID internamente via `findById()`, mas isso não é exposto como rota própria.
- **`POST`/`DELETE` protegidos por `JwtAuthGuard`**: a spec não menciona autenticação explicitamente; aplicado por consistência com o padrão já estabelecido no módulo `produtos` (mesma arquitetura, não um novo padrão).

---

## Evolução Futura

- Adicionar módulo `pedidos` que referencia `Marceneiro`
- Avaliar se `GET`/`PATCH` também devem exigir autenticação (hoje só `create`/`delete` usam `JwtAuthGuard`)

---

## O que NÃO Fazer Neste Módulo

- Não implementar lógica de pedidos aqui
- Não fazer `DELETE` físico — sempre soft delete
- Não acessar `PrismaClient` fora de `infrastructure/repositories/`
