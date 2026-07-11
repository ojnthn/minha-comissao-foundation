# Logging

## Mecanismo

`Logger` nativo do NestJS (`@nestjs/common`). Sem biblioteca externa de logging.

## LoggingInterceptor

Localizado em `src/shared/interceptors/logging/logging.interceptor.ts`.

Registrado globalmente via `APP_INTERCEPTOR` em `AppModule`:

```typescript
{ provide: APP_INTERCEPTOR, useClass: LoggingInterceptor }
```

### Comportamento

- Captura `method` e `url` do request antes de delegar ao handler
- Mede tempo de execução via `Date.now()` (início vs. fim do pipe)
- Loga no formato `METHOD /path — Xms` via `Logger`
- Não lança exceções — apenas observa via `tap` (RxJS)
- Não altera o corpo da resposta
- Não loga headers nem body — evita exposição de dados sensíveis

### Formato de log

```
GET /health — 3ms
POST /auth — 45ms
POST /auth/register — 120ms
```

## Logger em Outros Contextos

Cada classe que faz log instancia seu próprio `Logger` com o nome da classe:

```typescript
private readonly logger = new Logger(GlobalExceptionFilter.name);
```

Usado em:
- `GlobalExceptionFilter` — loga erros inesperados (500) com `logger.error`
- `RestClientService` — loga requests e respostas de APIs externas

## Regras

- Usar sempre `Logger` do NestJS — nunca `console.log` em produção
- Nunca logar dados sensíveis (tokens JWT, hashes de senha, body completo de requests)
- Erros de domínio esperados (`DomainException` e subclasses) **não são logados** — são erros de negócio, não de sistema
- Erros inesperados (não mapeados no `GlobalExceptionFilter`) **são logados** com nível `error`

## O que é Proibido

- `console.log` em qualquer código de produção
- Logar headers de autenticação, tokens JWT ou hashes de senha
- Logar o corpo completo de requests (pode conter dados pessoais)
