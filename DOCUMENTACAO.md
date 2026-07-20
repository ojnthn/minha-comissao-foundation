# Documentação para construção do Frontend — Minhas Vendas

Este documento orienta a IA (ou dev) na construção de um frontend que consome esta API. Contém domínio, contratos de endpoints, regras de auth/erro e regras de trabalho. Baseado no código-fonte atual (`src/`, `prisma/schema.prisma`) — em caso de divergência futura, o código da API é fonte de verdade sobre os contratos técnicos aqui descritos.

## 1. Domínio

API de gerenciamento de pedidos e comissões para representantes de vendas de chapas de MDF.

Entidades:
- **Usuario** — quem opera o sistema (login, cadastra/exclui registros). Não há endpoint de cadastro de usuário exposto — só login.
- **Produto** — chapa de MDF. Tem comissão percentual padrão associada.
- **ComissaoPorcentagem** — percentual de comissão (nome + valor). Só existe como FK de Produto (`idComissaoPorcentagemPadrao`). **Não há CRUD exposto para essa entidade na API atual** — se o frontend precisar de um seletor de comissões, alinhar com backend antes (não inventar endpoint).
- **Marceneiro** — cliente/comprador dos pedidos.
- **Pedido** — venda feita a um Marceneiro, contendo N Produtos (com valor e % de comissão daquele item no momento da venda).

Todas as entidades de negócio (Produto, Marceneiro, Pedido) usam **soft delete**: campos `logDataExclusao` / `logIdUsuarioExclusao`. Registro excluído não aparece em list/get e operações sobre ele retornam 404.

## 2. Stack sugerida do frontend

React (conforme já definido no domínio do backend). Sem restrição de meta-framework documentada — usar o que o time já padronizar (Vite, Next, etc.), mas **não decidir isso sozinho sem confirmar** — é decisão arquitetural.

## 3. Base da API

- Porta padrão: `3000` (`PORT` env, default 3000)
- Prefixo de rotas: nenhum (rotas na raiz, ex. `/auth/login`, `/produtos`)
- Swagger/OpenAPI: `GET /docs`
- Content-Type: `application/json`
- Validação global: `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true` — **campos extras no body são rejeitados** (400). Enviar só os campos documentados.

## 4. Autenticação

JWT Bearer. Sem refresh token — expira em `JWT_EXPIRATION` (default `15m`) e usuário precisa logar de novo.

### POST /auth/login
Público. Body:
```json
{ "email": "user@example.com", "senha": "123456" }
```
Resposta 200:
```json
{ "token": "<jwt>" }
```
Erro 401 se credenciais inválidas.

### Uso do token
Header em rotas protegidas: `Authorization: Bearer <token>`
Payload do JWT: `{ sub: <idUsuario> }`. Frontend não precisa decodificar — apenas guardar e reenviar o token.

Sem token ou token inválido/expirado em rota protegida → 401.

**Estado de auth no frontend:** guardar token (ex. memória + localStorage/sessionStorage conforme decisão do time), anexar em toda chamada a rota protegida, redirecionar para login em 401.

## 5. Endpoints

### Auth
| Método | Rota | Protegida | Descrição |
|---|---|---|---|
| POST | `/auth/login` | não | autentica, retorna token |

### Produtos (`/produtos`)
| Método | Rota | Protegida | Descrição |
|---|---|---|---|
| GET | `/produtos?page=&limit=&nome=` | não | lista paginada; com `nome` preenchido, filtra por nome (parcial) em vez de listar tudo |
| GET | `/produtos/:id` | não | busca por id |
| POST | `/produtos` | **sim** | cria |
| PATCH | `/produtos/:id` | não | atualiza |
| DELETE | `/produtos/:id` | **sim** | soft delete |

**Nota de inconsistência real do backend:** `PATCH /produtos/:id` **não** exige JWT no código atual, apesar de ser mutação. Não "corrigir" isso no frontend, é comportamento do backend — só reportar se o time achar relevante.

CreateProdutoDto:
```json
{ "nome": "Chapa MDF Branco 15mm", "valorPorM2": 89.9, "idComissaoPorcentagemPadrao": 1 }
```
`valorPorM2` é obrigatório (double). UpdateProdutoDto (todos campos opcionais, mesmo shape).

Resposta de item (create/get/update):
```json
{ "id": 1, "nome": "Chapa MDF Branco 15mm", "valorPorM2": 89.9, "idComissaoPorcentagemPadrao": 1 }
```

Resposta de lista (`GET /produtos` e `GET /produtos?nome=...`, mesmo shape):
```json
{
  "pagination": { "current": 1, "next": 2 },
  "details": [ { "id": 1, "nome": "...", "valorPorM2": 89.9, "idComissaoPorcentagemPadrao": 1 } ]
}
```
`pagination.next` é `null` quando não há próxima página.

DELETE retorna 200 (não 204) — soft delete, sem body relevante além do status.

### Marceneiro (`/marceneiro`)
| Método | Rota | Protegida | Descrição |
|---|---|---|---|
| GET | `/marceneiro?page=&limit=` | não | lista paginada |
| GET | `/marceneiro/:nome` | não | busca por nome (parcial, ver use case) — **atenção: mesmo path pattern de `/marceneiro/:id` do PATCH, mas aqui é busca por nome, não por id** |
| POST | `/marceneiro` | **sim** | cria |
| PATCH | `/marceneiro/:id` | não | atualiza |
| DELETE | `/marceneiro/:id` | **sim** | soft delete |

CreateMarceneiroDto: `{ "nome": "João da Marcenaria", "telefone"?: "(11) 98765-4321" }` (`telefone` opcional)
UpdateMarceneiroDto: `{ "nome"?: "...", "telefone"?: "..." }`

Resposta de item (create/update): `{ "id": 1, "nome": "...", "telefone": string | null }`

Resposta de lista/busca (`GET /marceneiro`, `GET /marceneiro/:nome`) usa shape **diferente** de produtos —
`{ "paginacao": { "atual": 1, "proxima": 1 }, "detalhes": [ { "id": 1, "nome": "...", "telefone": string | null } ] }`.
`paginacao.proxima` **repete** `atual` quando não há próxima página (nunca é `null`) — comparar `proxima !== atual`, não `proxima !== null`.

### Pedidos (`/pedidos`)
**Controller inteiro protegido** (`@UseGuards(JwtAuthGuard)` a nível de classe) — toda rota exige `Authorization: Bearer <token>`, incluindo GET.

| Método | Rota | Descrição |
|---|---|---|
| POST | `/pedidos` | cria pedido |
| GET | `/pedidos?...` | lista paginada com filtros |
| PATCH | `/pedidos/:id` | atualiza |
| DELETE | `/pedidos/:id` | soft delete (retorna **204**) |

CreatePedidoDto:
```json
{
  "valor": 1500.0,
  "idMarceneiro": 3,
  "produtos": [
    { "idProduto": 5, "valorProduto": 800, "valorPorcentagem": 10 }
  ]
}
```
`produtos` exige ao menos 1 item. UpdatePedidoDto: mesmos campos, todos opcionais.

Validações de negócio no create/update (retornam 400 `BadRequestException`):
- `idMarceneiro` precisa existir e não estar excluído
- todo `idProduto` em `produtos` precisa existir e não estar excluído (erro lista os ids inválidos)

Resposta de create:
```json
{ "id": 10, "valor": 1500.0, "idMarceneiro": 3, "produtos": [5] }
```
(`produtos` no retorno de create/update é só array de ids, não os objetos completos)

Resposta de update:
```json
{ "valor": 1500.0, "idMarceneiro": 3, "produtos": [5] }
```

Query params de `GET /pedidos`:
| Param | Tipo | Descrição |
|---|---|---|
| `idMarceneiro` | int opcional | filtra por marceneiro |
| `porUsuario` | boolean opcional | filtra só pedidos cadastrados pelo usuário logado (usa o `sub` do token, não passa idUsuario manualmente) |
| `dataInicio` | date ISO opcional (`YYYY-MM-DD`) | início do range de `logDataCadastro` |
| `dataFim` | date ISO opcional | fim do range |
| `page`, `limit` | int, default 1/10 | paginação |

Resposta de lista (**shape rico, formatado para exibição — valores já vêm formatados em BRL/string**):
```json
{
  "pagination": { "current": 1, "next": 2, "total": 42 },
  "data": [
    {
      "id": 10,
      "codigo": "#00010",
      "valor": "R$ 1.500,00",
      "marceneiro": { "id": 3, "nome": "João da Marcenaria" },
      "usuarioCadastro": { "id": 1, "nome": "Jonathan" },
      "produtos": [
        { "id": 5, "nome": "Chapa MDF Branco 15mm", "valor": "R$ 800,00", "porcentagem": "10%" }
      ]
    }
  ]
}
```
**Atenção:** `valor` e `porcentagem` nesse endpoint já vêm como string formatada (moeda BRL / `%`), diferente de create/update que retornam número cru. Não tentar `parseFloat` esperando número puro sem tratar o formato — se precisar do valor numérico para cálculo no frontend, calcular a partir do payload enviado no create/update, não desse GET.

`pagination.next` em pedidos, diferente de produtos/marceneiro, **nunca é `null`** — quando não há próxima página, `next` repete o valor de `current`. Tratar isso ao decidir se mostra botão "próxima página" (comparar `next !== current`, não `next !== null`).

## 6. Formato de erro (todas as rotas)

Filtro global (`GlobalExceptionFilter`) padroniza toda exceção nesse shape:
```json
{ "statusCode": 401, "message": "Credenciais inválidas" }
```
Mapeamento:
| Exceção de domínio | HTTP |
|---|---|
| Validação de DTO (class-validator) | 400 |
| `BadRequestException` | 400 |
| `UnauthorizedException` | 401 |
| `NotFoundException` | 404 |
| `ConflictException` | 409 |
| outra `DomainException` | 422 |
| não tratada | 500, `message: "Erro interno do servidor"` |

Erros de validação de DTO (class-validator) vêm com `message` podendo ser array de strings (comportamento padrão do NestJS ValidationPipe) — tratar `message` no frontend como `string | string[]`.

## 7. Regras de trabalho para a IA (herdadas do CLAUDE.md do backend, aplicam-se ao frontend também)

- Documentação prevalece sobre código — em conflito, reportar a divergência, não assumir qual está certo silenciosamente.
- Nunca criar novos padrões arquiteturais (ex. novo state manager, nova lib de data-fetching) sem atualizar a documentação primeiro.
- Nunca alterar arquitetura definida sem solicitação explícita do usuário.
- Nunca renomear contratos existentes (nomes de campos, rotas) nem inventar campos que a API não retorna.
- Nunca adicionar dependências novas sem justificar.
- Não inventar endpoints que não existem (ex. CRUD de `ComissaoPorcentagem`, cadastro de usuário) — API não os expõe hoje.
- Ao consumir `/pedidos`, respeitar que o controller inteiro exige JWT, incluindo leitura.
- Ao implementar paginação, tratar produtos/marceneiro (`next: number | null`) e pedidos (`next` repete `current` no fim) como padrões **diferentes** — não abstrair como se fossem iguais sem checar qual endpoint está em uso.
