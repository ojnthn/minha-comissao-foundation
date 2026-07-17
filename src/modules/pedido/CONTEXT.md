# CONTEXT — Pedido

## Responsabilidade

`PedidoModule` gerencia o cadastro de pedidos feitos por marceneiros: criação, listagem (com filtros e paginação), alteração e remoção (soft delete) de um pedido e seus itens (`PedidoProduto`).

> SRP: este módulo tem exatamente uma razão para mudar — regras de cadastro/alteração de pedido e seus itens.

---

## Escopo

### Dentro do escopo

- CRUD de pedido (criar, listar, atualizar, remover) vinculado a um `Marceneiro` e a um ou mais `Produto` (via `PedidoProduto`)
- Criação/alteração de `Pedido` + `PedidoProduto[]` em transação única (rollback em caso de falha)
- Validação de existência/ativo de `idMarceneiro` e `idProduto` antes de gravar
- Soft delete via `logDataExclusao`/`logIdUsuarioExclusao`
- Proteger todas as rotas (`POST`, `GET`, `PATCH`, `DELETE`) com `JwtAuthGuard` — exigência explícita da spec (`docs/specs/pedido.md`), diferente de `marceneiro`/`produtos` (que só protegem `create`/`delete`)

### Fora do escopo

- Recalcular `valor` do pedido a partir dos produtos — o valor vem pronto no body
- Agregações/relatórios (soma de valores por período etc.)
- Exclusão física (hard delete) em qualquer rota
- CRUD de `Marceneiro`/`Produto` (módulos próprios)

---

## Casos de Uso

| Use Case | Arquivo | Rota |
|---|---|---|
| `CreatePedidoUseCase` | `application/use-cases/create-pedido.use-case.ts` | `POST /pedidos` |
| `ListPedidosUseCase` | `application/use-cases/list-pedidos.use-case.ts` | `GET /pedidos` |
| `UpdatePedidoUseCase` | `application/use-cases/update-pedido.use-case.ts` | `PATCH /pedidos/:id` |
| `DeletePedidoUseCase` | `application/use-cases/delete-pedido.use-case.ts` | `DELETE /pedidos/:id` |

---

## Entidades de Domínio

### Pedido

| Campo | Tipo | Invariante |
|---|---|---|
| `id` | `number` | Gerado pelo banco (auto-incremento); imutável |
| `valor` | `number` | Obrigatório, > 0 (vem pronto no body — não é recalculado) |
| `idMarceneiro` | `number` | Obrigatório, inteiro positivo (FK para `Marceneiro`) |
| `produtos` | `PedidoProdutoProps[]` | Obrigatório, mínimo 1 item (`idProduto`, `valorProduto`, `valorPorcentagem`) |
| `logDataCadastro` | `Date` | Definido na criação; imutável |
| `logIdUsuarioCadastro` | `number` | Usuário que cadastrou; imutável |
| `logDataExclusao` | `Date \| null` | `null` enquanto ativo; preenchido no soft delete |
| `logIdUsuarioExclusao` | `number \| null` | Usuário que excluiu; preenchido no soft delete |

> Entidade usa constructor privado + factory `create()` que retorna `Result<T>`. `produtos` é um array de value objects simples (`idProduto`/`valorProduto`/`valorPorcentagem`), sem entidade própria — não há operações de negócio isoladas por item.

## Value Objects

Não se aplica — itens de `produtos` são objetos simples validados na entidade `Pedido` (mínimo 1 item).

---

## Interface do Repositório

```typescript
// domain/repositories/pedido.repository.interface.ts

export const PEDIDO_REPOSITORY = 'PEDIDO_REPOSITORY';

export interface IPedidoRepository {
  criar(data: CriarPedidoData): Promise<Pedido>;
  atualizar(id: number, data: AtualizarPedidoData): Promise<Pedido>;
  excluir(id: number, idUsuarioExclusao: number): Promise<void>;
  buscarPorId(id: number): Promise<Pedido | null>;
  listar(filtro: ListarPedidosFiltro): Promise<ListarPedidosResult>; // { data: PedidoListagemItem[]; total: number }
  marceneiroAtivoExiste(id: number): Promise<boolean>;
  produtosAtivosExistentes(ids: number[]): Promise<number[]>;
}
```

> `PedidoListagemItem` é um tipo de leitura próprio (não a entidade `Pedido`) que já traz `marceneiroNome` e os `produtos` com `nome` — necessário porque a listagem exige dados de `Marceneiro`/`Produto` via join, o que não faz parte do núcleo da entidade `Pedido`.

---

## Contrato da API

### `POST /pedidos`

**Header:** `Authorization: Bearer <token>` (obrigatório — `JwtAuthGuard`)

**Request body:**
```json
{
  "valor": 1500.00,
  "idMarceneiro": 3,
  "produtos": [
    { "idProduto": 5, "valorProduto": 800, "valorPorcentagem": 10 }
  ]
}
```

**Response (201):**
```json
{ "id": 1, "valor": 1500, "idMarceneiro": 3, "produtos": [5] }
```

### `GET /pedidos?idMarceneiro=3&porUsuario=true&dataInicio=2026-01-01&dataFim=2026-12-31&page=1&limit=10&ordem=mais-novo`

> `porUsuario=true` filtra somente os pedidos cujo `logIdUsuarioCadastro` é o usuário autenticado (do JWT).
> `ordem` (opcional): `mais-antigo` (padrão, `logDataCadastro` ASC) ou `mais-novo` (`logDataCadastro` DESC).

**Response (200):**
```json
{
  "pagination": { "current": 1, "next": null },
  "detalhes": [
    {
      "id": 1,
      "codigo": "#00001",
      "data": "01/01/2026",
      "marceneiro": { "id": 3, "nome": "João da Marcenaria" },
      "vendedor": { "id": 2, "nome": "Vendedor Teste" },
      "valor": { "total": "R$ 1.500,00", "comissao": "R$ 80,00" },
      "produtos": [
        { "id": 5, "nome": "MDF XX", "valor": "R$ 800,00", "porcentagem": "10%" }
      ]
    }
  ]
}
```

> `valor.comissao` = soma de `valorProduto * (valorPorcentagem / 100)` de cada item de `produtos` do pedido (não persistido; calculado no `ListPedidosUseCase`).
> `pagination.next` é `null` quando não há próxima página (antes retornava a própria página atual).
> `vendedor` é o mesmo dado antes exposto como `usuarioCadastro` — renomeado apenas no contrato de saída desta rota (repositório/domínio continuam usando `usuarioCadastro`).

### `PATCH /pedidos/:id`

**Request body (todos os campos opcionais; `produtos`, se enviado, substitui a lista inteira):**
```json
{ "valor": 1800.5 }
```

**Response (200):**
```json
{ "valor": 1800.5, "idMarceneiro": 3, "produtos": [5] }
```

### `DELETE /pedidos/:id`

**Header:** `Authorization: Bearer <token>` (obrigatório)

Sem corpo — `idUsuarioExclusao` vem do `id` (claim `sub`) do JWT via `@CurrentUser()`.

**Response (204):** sem corpo

---

## Erros Esperados

| Exceção | Código HTTP | Quando ocorre |
|---|---|---|
| `BadRequestException` | `400` | `idMarceneiro` inexistente/excluído, ou algum `idProduto` inexistente/excluído (create/update) |
| `BadRequestException` (via `ValidationPipe`) | `400` | `produtos` vazio/ausente ou payload inválido (validação de shape) |
| `NotFoundException` | `404` | Pedido não existe ou já foi excluído — em `update`/`delete` |
| `UnauthorizedException` (via `JwtAuthGuard`) | `401` | Qualquer rota chamada sem token válido |

---

## Fluxo de Execução

### CreatePedidoUseCase

```
1. Controller recebe CreatePedidoDto → chama CreatePedidoUseCase.execute(input)
2. UseCase valida idMarceneiro ativo via IPedidoRepository.marceneiroAtivoExiste()
3. UseCase valida cada idProduto ativo via IPedidoRepository.produtosAtivosExistentes()
4. [Se inválido] → throw BadRequestException → HTTP 400
5. UseCase chama IPedidoRepository.criar() — Pedido + PedidoProduto[] em transação única
6. Controller retorna HTTP 201 com { id, valor, idMarceneiro, produtos: idProduto[] }
```

### UpdatePedidoUseCase

```
1. Controller chama UpdatePedidoUseCase.execute() com :id da rota
2. UseCase busca pedido via IPedidoRepository.buscarPorId()
3. [Se não existe ou já excluído] → throw NotFoundException → HTTP 404
4. [Se idMarceneiro enviado] → valida ativo; [Se produtos enviado] → valida cada idProduto ativo
5. UseCase chama IPedidoRepository.atualizar() — se produtos enviado, substitui a lista inteira (delete + insert) na mesma transação
6. Controller retorna HTTP 200 com { valor, idMarceneiro, produtos: idProduto[] }
```

### DeletePedidoUseCase

```
1. Controller chama DeletePedidoUseCase.execute() com :id da rota e usuário autenticado
2. UseCase busca pedido via buscarPorId(); [não existe/já excluído] → NotFoundException
3. UseCase chama IPedidoRepository.excluir() — soft delete apenas no Pedido; PedidoProduto não é tocado
4. Controller retorna HTTP 204 sem corpo
```

### ListPedidosUseCase

```
1. Controller chama ListPedidosUseCase.execute() com filtros (idMarceneiro, dataInicio, dataFim, ordem) e page/limit
2. UseCase chama IPedidoRepository.listar() — sempre filtra logDataExclusao IS NULL, inclui marceneiro e produtos via join, ordena por logDataCadastro (asc/desc conforme `ordem`)
3. UseCase formata a resposta: codigo (id zero-padded), data (DD/MM/YYYY de logDataCadastro), valor.total/valor.comissao e produto.valor em BRL, porcentagem com "%"
4. UseCase monta pagination (current/next, next null quando não há próxima página)
```

---

## Limites

- Não acessa banco diretamente — apenas via `IPedidoRepository` (DIP)
- Não conhece `PrismaPedidoRepository` (OCP)
- Domain não importa `@nestjs/*`, Prisma, `class-validator` ou qualquer lib externa
- Controller não contém lógica de negócio
- Não importa repositórios de `Marceneiro`/`Produto` de outros módulos — validação de existência é feita via consultas próprias do `PrismaPedidoRepository` (mesmo `PrismaClient`), evitando alterar `exports` de `MarceneiroModule`/`ProdutosModule`

---

## Regras Obrigatórias

- Regra de dependência: `presentation → application → domain ← infrastructure`
- Um use case por operação
- Use cases lançam `BadRequestException`/`NotFoundException` — nunca retornam `null` silenciosamente
- Criação/alteração de `Pedido` + `PedidoProduto[]` sempre em transação única (`prisma.$transaction`)
- Mapper `toDomain()` isolado em `PrismaPedidoRepository`
- Remoção é sempre soft delete — nunca `DELETE` físico no banco (nem em `Pedido`, nem em `PedidoProduto`)

---

## O que é Proibido

- Importar `@nestjs/*`, Prisma ou libs externas no domínio
- Acessar `PrismaClient` diretamente em use cases ou controllers
- Vazar tipos Prisma (`PrismaPedido`, `PrismaPedidoProduto`) para fora do repositório
- Excluir fisicamente um pedido ou seus itens (usar apenas soft delete no `Pedido`)
- Recalcular `valor` a partir dos produtos

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
| Entidade | `domain/entities/pedido.entity.ts` | `Pedido` |
| Interface repositório | `domain/repositories/pedido.repository.interface.ts` | `IPedidoRepository` |
| Token DI | mesmo arquivo da interface | `PEDIDO_REPOSITORY` |
| Use case | `application/use-cases/{acao}-pedido(s).use-case.ts` | `{Acao}Pedido(s)UseCase` |
| DTO | `application/dtos/{nome}.dto.ts` | `{Nome}Dto` |
| Repositório Prisma | `infrastructure/repositories/prisma-pedido.repository.ts` | `PrismaPedidoRepository` |
| Controller | `presentation/controllers/pedido.controller.ts` | `PedidoController` |

---

## Relação com Outros Componentes

| Componente | Relação |
|---|---|
| `shared/exceptions/domain.exception` | Use cases lançam `BadRequestException`/`NotFoundException`; `BadRequestException` foi adicionada ao arquivo compartilhado (mapeada para HTTP 400 em `GlobalExceptionFilter`) — nenhum outro módulo até então precisava de erro 400 de domínio |
| `shared/types/result` | `Pedido.create()` retorna `Result<Pedido>` |
| `Marceneiro` (Prisma) | `idMarceneiro` referencia esse model; existência/ativo validada via query direta no `PrismaPedidoRepository` (não via `MarceneiroModule`) |
| `Produto` (Prisma) | `idProduto` (em `PedidoProduto`) referencia esse model; mesma validação direta |
| `auth` módulo | `PedidoModule` importa `AuthModule` para usar `JwtAuthGuard`/`@CurrentUser()` em todas as rotas |

---

## Decisões Técnicas

- **Todas as rotas protegidas por `JwtAuthGuard`**: a spec (`docs/specs/pedido.md`) exige usuário autenticado em todas as rotas de pedido, diferente de `marceneiro`/`produtos` (só `create`/`delete`). Seguido literalmente por ser exigência explícita da spec.
- **Validação de `idMarceneiro`/`idProduto` direto no `PrismaPedidoRepository`**: em vez de importar `MARCENEIRO_REPOSITORY`/`PRODUTO_REPOSITORY` de outros módulos (que exigiria adicionar `exports` em `MarceneiroModule`/`ProdutosModule`), o repositório de pedido consulta diretamente as tabelas `marceneiro`/`produto` via o mesmo `PrismaClient`. Evita alterar a arquitetura de dois módulos já existentes para uma checagem simples de FK.
- **Nova exceção `BadRequestException` (400)**: `shared/exceptions/domain.exception.ts` não tinha uma exceção mapeada para 400; adicionada por ser exigência explícita da spec (`idMarceneiro`/`idProduto` inexistente → 400), seguindo o mesmo padrão das exceções já existentes (`NotFoundException`, `ConflictException`, etc.).
- **Nomenclatura do repositório em português (`criar`/`atualizar`/`excluir`/`listar`)**: a spec define esses nomes explicitamente na seção "Repositório / Dependências" — diferente de `marceneiro`/`produtos`, que usam `create`/`update`/`softDelete`/`findAll` (inglês). Seguido conforme a spec (documentação prevalece).
- **`listar` retorna `{ data, total }` (contagem total), não `hasNext`**: também definido explicitamente na spec, diferente do padrão `hasNext` usado em `marceneiro`/`produtos`.
- **Parâmetro `idUsuario` do `atualizar` (spec) não persistido**: a spec define `atualizar(id, dto, idUsuario)`, mas o schema `Pedido` não tem coluna de auditoria de alteração (só cadastro/exclusão). Como não há onde persistir esse dado, `atualizar()` na implementação não recebe `idUsuario` — apenas `excluir()` o faz (`logIdUsuarioExclusao`), que tem coluna correspondente.
- **Campo `codigo` da listagem**: a spec mostra `"codigo": "#{idProduto}"` com a nota "preencha com zeros até 5 caracteres", mas `codigo` é um campo do pedido (não do produto). Interpretado como o `id` do próprio pedido, zero-padded a 5 dígitos com prefixo `#` (ex.: `#00001`) — a referência a `idProduto` na spec parece um erro de digitação/copy-paste. **Sinalizar para confirmação se a intenção era outra.**
- **Formato de moeda (`R$ 1.500,00`) e porcentagem (`10%`)**: implementado com `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })` para valores monetários; porcentagem é apenas `${valor}%` (sem casas decimais fixas), seguindo os exemplos literais da spec.
- **Campos de paginação em inglês (`pagination`/`current`/`next`/`total`)**: a spec usa `pagination`/`data` no nível superior (estilo `produtos`, não `marceneiro`); o conteúdo interno de `pagination` (não especificado na spec) seguiu o padrão de `produtos` (`current`/`next`), com `total` adicionado por já estar disponível no retorno do repositório.
- **Filtro `porUsuario` (query, boolean)**: quando `true`, filtra a listagem por `logIdUsuarioCadastro` igual ao usuário do JWT (`@CurrentUser()`), reaproveitando o filtro `idUsuarioCadastro` já existente no repositório. Não faz parte da spec original — adicionado a pedido do usuário após a primeira implementação.
- **`usuarioCadastro` (`id`/`nome`) na listagem**: adicionado ao item de listagem (join com `Usuario` via `usuarioCadastro`), também a pedido do usuário — mesmo padrão usado para `marceneiro`/`produtos` aninhados na resposta.
- **Contrato de `GET /pedidos` alterado (`docs/specs/user-data.md`)**: `data`→`detalhes`, `usuarioCadastro`→`vendedor` (só no output), `valor` (string) virou `{ total, comissao }`, campo `data` (pedido) adicionado, `pagination.total` removido, `pagination.next` passa a ser `null` (antes repetia a página atual) quando não há próxima página. Mudança de contrato pedida explicitamente pela spec (`Objetivo: alterar o retorno do contrato da listagem de pedidos`).
- **Fórmula de `valor.comissao`**: a spec não define a fórmula (seção "Repositório / Dependências" e "Regras específicas" ficaram como placeholder). Implementado como `Σ (valorProduto × valorPorcentagem / 100)` de cada item de `produtos`, reaproveitando dados já carregados na listagem (sem query adicional). **Não persistido** — calculado em runtime no `ListPedidosUseCase`, não fere a regra de não recalcular `valor` do pedido (esse continua vindo direto do banco em `valor.total`). Sinalizar para confirmação se a fórmula esperada for outra (ex.: só sobre o primeiro produto, ou percentual fixo por pedido).
- **Novo parâmetro `ordem` (`mais-antigo` \| `mais-novo`)**: adicionado ao `GET /pedidos` conforme spec ("implemente uma ordenacao..."). Ordena por `logDataCadastro`; padrão `mais-antigo` (ASC) preserva o comportamento anterior (que ordenava por `id` ASC).

---

## Evolução Futura

- Se `Marceneiro`/`Produto` ganharem uma necessidade real de reuso cross-module (além de checagem de FK), avaliar exportar `MARCENEIRO_REPOSITORY`/`PRODUTO_REPOSITORY` em seus módulos
- Avaliar índices em `pedido.id_marceneiro` e `pedido.log_data_cadastro` se os filtros de listagem (`idMarceneiro`, `dataInicio`/`dataFim`) tiverem uso intenso em produção

---

## O que NÃO Fazer Neste Módulo

- Não recalcular `valor` do pedido a partir dos produtos
- Não fazer `DELETE` físico — nem em `Pedido`, nem em `PedidoProduto`
- Não acessar `PrismaClient` fora de `infrastructure/repositories/`
- Não incluir pedidos excluídos na listagem, nem adicionar parâmetro para trazê-los
