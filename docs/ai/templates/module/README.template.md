# {NomeModulo}

## Objetivo

{Descreva em 1-2 frases o que este módulo faz e qual problema de negócio ele resolve.}

---

## Responsabilidades

- {Responsabilidade 1 — ação concreta e mensurável}
- {Responsabilidade 2}
- {Responsabilidade 3}

> Cada responsabilidade deve ser única e não se sobrepor a outro módulo.

---

## Casos de Uso

| Use Case | Descrição | Rota HTTP |
|---|---|---|
| `{NomeUseCase}` | {O que executa em uma frase} | `{MÉTODO} /{rota}` |
| `{OutroUseCase}` | {O que executa em uma frase} | `{MÉTODO} /{rota}` |

---

## Fluxo Principal

```
Cliente → Controller → UseCase → Repository → Banco de dados
                     ↓
               DomainException (em caso de falha)
                     ↓
          GlobalExceptionFilter → Resposta HTTP
```

### Detalhamento por use case

#### {NomeUseCase}

1. Controller recebe `{NomeDto}` e chama `{NomeUseCase}.execute(input)`
2. Use case {ação de negócio}
3. Use case chama `{INomeRepository}.{método}()`
4. {Se falha de negócio}: lança `{NomeException}` → retorna HTTP {código}
5. Controller retorna `{resposta}` com status {código}

---

## Estrutura Interna

```
{module-name}/
├── CONTEXT.md
├── README.md
├── domain/
│   ├── entities/
│   │   └── {nome}.entity.ts
│   ├── repositories/
│   │   └── {nome}.repository.interface.ts
│   └── value-objects/
│       └── {campo}.vo.ts
├── application/
│   ├── use-cases/
│   │   ├── {acao}.use-case.ts
│   │   └── {acao}.use-case.spec.ts
│   └── dtos/
│       └── {nome}.dto.ts
├── infrastructure/
│   ├── repositories/
│   │   └── prisma-{nome}.repository.ts
│   ├── guards/             (se aplicável)
│   └── strategies/         (se aplicável)
├── presentation/
│   └── controllers/
│       └── {nome}.controller.ts
└── {module-name}.module.ts
```

---

## Dependências

### Módulos NestJS importados

| Módulo | Finalidade |
|---|---|
| `ConfigModule` | Acesso a variáveis de ambiente via namespace |
| `{OutroModulo}` | {Para que é usado} |

### Módulos do projeto importados

| Módulo | Finalidade |
|---|---|
| `{NomeModulo}Module` | {Para que é usado} |

### Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `{VARIAVEL}` | Sim | {O que representa} |

---

## Como Utilizar

### Registrar no AppModule

```typescript
import { {NomeModulo}Module } from './modules/{module-name}/{module-name}.module';

@Module({
  imports: [{NomeModulo}Module],
})
export class AppModule {}
```

### Chamar a API

```http
{MÉTODO} /{rota}
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "{campo}": "{valor}"
}
```

---

## Exemplos

### {Caso de uso 1 — happy path}

**Request:**
```http
POST /{rota}
Content-Type: application/json

{
  "{campo}": "{valor de exemplo}"
}
```

**Response (201):**
```json
{
  "{campo}": "{valor retornado}"
}
```

### {Caso de uso 2 — erro esperado}

**Response (409):**
```json
{
  "statusCode": 409,
  "message": "{mensagem de erro}"
}
```

---

## Erros Comuns

| Código HTTP | Mensagem | Causa |
|---|---|---|
| `400` | `{mensagem}` | Validação de DTO falhou |
| `401` | `Unauthorized` | Token ausente ou expirado |
| `409` | `{mensagem}` | {Conflito de regra de negócio} |
| `422` | `{mensagem}` | {Violação de regra de domínio} |

---

## Como Testar

```bash
# Todos os testes do módulo
npm run test -- --testPathPattern={module-name}

# Apenas testes e2e
npm run test:e2e -- --testPathPattern={module-name}

# Cobertura
npm run test:cov -- --testPathPattern={module-name}
```

---

## Observações

- {Limitação conhecida ou comportamento não óbvio}
- {Outra observação relevante para o desenvolvedor}
