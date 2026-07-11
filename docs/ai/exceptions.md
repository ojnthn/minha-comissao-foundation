# Exceções

## Hierarquia

Todas as exceções de domínio estendem `DomainException`, em `src/shared/exceptions/domain.exception.ts`:

```
Error
└── DomainException
    ├── UnauthorizedException
    ├── ConflictException
    └── NotFoundException
```

## Mapeamento para HTTP

`GlobalExceptionFilter` mapeia cada classe para o status HTTP correto:

| Classe | Status HTTP | Quando usar |
|---|---|---|
| `DomainException` | 422 Unprocessable Entity | Violação genérica de regra de negócio |
| `UnauthorizedException` | 401 Unauthorized | Credenciais inválidas ou usuário inativo |
| `ConflictException` | 409 Conflict | Recurso já existe (ex: email duplicado) |
| `NotFoundException` | 404 Not Found | Recurso não encontrado |
| `HttpException` (NestJS) | original status | Repassado sem alteração |
| Qualquer outra exceção | 500 Internal Server Error | Erro inesperado — logado via `Logger` |

## Formato de Resposta

```json
{
  "statusCode": 401,
  "message": "Credenciais inválidas"
}
```

## Regras de Uso

- Use cases lançam subclasses específicas — nunca `DomainException` diretamente quando houver subclasse adequada
- Entidades e value objects **não lançam exceções** — retornam `Result<T>` com `fail()`
- Use cases **lançam exceções** em falha — nunca retornam `null` silenciosamente
- `GlobalExceptionFilter` é o único lugar onde exceções são convertidas em respostas HTTP

## GlobalExceptionFilter

- Registrado globalmente via `APP_FILTER` em `AppModule`
- Anotado com `@Catch()` sem parâmetro — captura **todas** as exceções não tratadas
- Loga apenas exceções inesperadas (500) via `Logger`
- Exceções de domínio não são logadas — são erros esperados de negócio, não de sistema

## Adicionando Novas Exceções

1. Criar subclasse de `DomainException` em `shared/exceptions/domain.exception.ts`
2. Mapear para o status HTTP correto em `GlobalExceptionFilter` (`shared/filters/global-exception/global-exception.filter.ts`)
3. Nunca criar exceções de domínio fora de `shared/exceptions/`

## Exemplos

```typescript
// Use case lança exceção específica
throw new UnauthorizedException();                      // 401
throw new ConflictException('Email já cadastrado');     // 409
throw new DomainException(userResult.error);            // 422

// Entidade retorna Result — nunca lança
const emailResult = Email.create(props.email);
if (!emailResult.ok) return fail(emailResult.error);
```

## O que é Proibido

- Lançar exceções dentro de entidades ou value objects — usar `Result<T>`
- Usar `throw new Error()` diretamente em código de domínio — usar subclasse de `DomainException`
- Criar exceções de domínio fora de `shared/exceptions/`
- Expor stack traces na resposta HTTP
- Lançar `DomainException` genérico quando houver subclasse mais adequada
