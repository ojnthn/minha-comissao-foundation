# Produtos

## Objetivo

Cadastro de produtos (chapas de MDF) vendidos pelos representantes, cada um vinculado a uma comissão percentual padrão.

---

## Responsabilidades

- Criar, listar, buscar, atualizar e remover (soft delete) produtos
- Vincular cada produto a uma `ComissaoPorcentagem` padrão

> Cálculo de comissão em pedidos e CRUD de `ComissaoPorcentagem` pertencem a outros módulos (ainda não implementados).

---

## Casos de Uso

| Use Case | Descrição | Rota HTTP |
|---|---|---|
| `CreateProdutoUseCase` | Cria um novo produto | `POST /produtos` |
| `ListProdutosUseCase` | Lista produtos ativos, paginado | `GET /produtos` |
| `GetProdutoUseCase` | Busca um produto pelo ID | `GET /produtos/:id` |
| `UpdateProdutoUseCase` | Atualiza nome/comissão padrão | `PATCH /produtos/:id` |
| `DeleteProdutoUseCase` | Remove um produto (soft delete) | `DELETE /produtos/:id` |

---

## Fluxo Principal

```
Cliente → ProdutosController → UseCase → PrismaProdutoRepository → MySQL
                              ↓
                    NotFoundException / DomainException (em caso de falha)
                              ↓
                   GlobalExceptionFilter → Resposta HTTP
```

---

## Estrutura Interna

```
produtos/
├── CONTEXT.md
├── README.md
├── domain/
│   ├── entities/
│   │   └── produto.entity.ts
│   └── repositories/
│       └── produto.repository.interface.ts
├── application/
│   ├── use-cases/
│   │   ├── create-produto.use-case.ts
│   │   ├── get-produto.use-case.ts
│   │   ├── list-produtos.use-case.ts
│   │   ├── update-produto.use-case.ts
│   │   └── delete-produto.use-case.ts
│   └── dtos/
│       ├── create-produto.dto.ts
│       ├── update-produto.dto.ts
│       ├── delete-produto.dto.ts
│       └── list-produtos-query.dto.ts
├── infrastructure/
│   └── repositories/
│       └── prisma-produto.repository.ts
├── presentation/
│   └── controllers/
│       └── produtos.controller.ts
└── produtos.module.ts
```

---

## Dependências

### Módulos NestJS importados

| Módulo | Finalidade |
|---|---|
| `ConfigModule` (global, via `AppModule`) | Acesso a `DATABASE_URL` |

### Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | Sim | Conexão MySQL usada pelo `PrismaClient` |

---

## Como Utilizar

### Registrar no AppModule

```typescript
import { ProdutosModule } from './modules/produtos/produtos.module';

@Module({
  imports: [ProdutosModule],
})
export class AppModule {}
```

### Chamar a API

```http
POST /produtos
Content-Type: application/json

{
  "nome": "Chapa MDF Branco 15mm",
  "idComissaoPorcentagemPadrao": 1,
  "idUsuarioCadastro": 1
}
```

---

## Exemplos

### Criar produto (happy path)

**Request:**
```http
POST /produtos
Content-Type: application/json

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

### Buscar produto inexistente (erro esperado)

**Response (404):**
```json
{ "statusCode": 404, "message": "Produto não encontrado" }
```

---

## Erros Comuns

| Código HTTP | Mensagem | Causa |
|---|---|---|
| `400` | `["Nome é obrigatório", ...]` | Validação de DTO falhou |
| `404` | `Produto não encontrado` | ID inexistente ou produto já excluído |
| `422` | `{mensagem}` | Violação de regra de domínio |

---

## Como Testar

```bash
npm run test -- --testPathPattern=produtos
npm run test:e2e -- --testPathPattern=produtos
npm run test:cov -- --testPathPattern=produtos
```

---

## Observações

- Não há autenticação ainda: `idUsuarioCadastro`/`idUsuarioExclusao` são enviados explicitamente no body. Isso muda quando o módulo `auth` for implementado (passam a vir de `@CurrentUser()`).
- Remoção é sempre soft delete (`logDataExclusao`/`logIdUsuarioExclusao`) — nunca `DELETE` físico.
