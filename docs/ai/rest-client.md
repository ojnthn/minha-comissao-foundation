# REST Client

## Visão Geral

`shared/http` é o módulo de HTTP compartilhado do projeto. Fornece um cliente HTTP tipado para consumo de APIs externas. Atualmente configurado para TMDB, mas abstraído via `RestClient` para ser substituível.

## Estrutura

```
shared/http/
├── contracts/
│   └── rest-client.interface.ts    # abstract class RestClient
├── dto/
│   └── request-config.dto.ts       # RequestConfig
├── exceptions/
│   └── external-api.exception.ts   # ExternalApiException
├── implementations/
│   └── rest-client.service.ts      # RestClientService (implementação Axios)
├── http.module.ts                  # HttpModule (NestJS module)
└── index.ts                        # barrel exports
```

## RestClient (Contrato)

```typescript
export abstract class RestClient {
  abstract get<TResponse>(endpoint: string, config?: RequestConfig): Promise<TResponse>;
  abstract post<TRequest, TResponse>(endpoint: string, body: TRequest, config?: RequestConfig): Promise<TResponse>;
}
```

- `abstract class` (não `interface`) para ser usável como token DI do NestJS diretamente
- Endpoints são relativos à `TMDB_BASE_URL` — `RestClientService` monta a URL completa

## RequestConfig

```typescript
interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, string | number>;
  timeout?: number;                  // override do timeout global por request
}
```

## ExternalApiException

Lançada quando a API externa retorna erro:

```typescript
export class ExternalApiException extends Error {
  constructor(
    public readonly status: number,    // HTTP status da API externa
    public readonly endpoint: string,  // endpoint chamado
    message: string,
  ) { ... }
}
```

- Estende `Error` (não `DomainException`) — é erro de infraestrutura, não de domínio
- `GlobalExceptionFilter` a captura como exceção não mapeada e retorna HTTP 500

## RestClientService (Implementação)

- Implementa `RestClient` via `@nestjs/axios` (`HttpService`)
- Lê `TMDB_BASE_URL`, `TMDB_API_KEY` e `API_TIMEOUT` via `ConfigService` no constructor
- Adiciona `Authorization: Bearer {TMDB_API_KEY}` automaticamente em todo request
- Loga requests (`→ METHOD /endpoint`) e respostas (`← METHOD /endpoint STATUS (Xms)`) via `Logger`
- Em erro: loga com `logger.error` e lança `ExternalApiException`

## HttpModule

```typescript
@Module({
  imports: [NestHttpModule, ConfigModule],
  providers: [{ provide: RestClient, useClass: RestClientService }],
  exports: [RestClient],
})
export class HttpModule {}
```

## Como Usar

Importar `HttpModule` no módulo que precisa de HTTP externo:

```typescript
// movies.module.ts
@Module({
  imports: [HttpModule],
  providers: [TmdbMoviesRepository, ...],
})
export class MoviesModule {}
```

Injetar `RestClient` via constructor:

```typescript
constructor(private readonly restClient: RestClient) {}

const data = await this.restClient.get<TResponse>('/discover/movie', {
  params: { page: 1, language: 'en-US' },
});
```

Chamadas independentes em paralelo:

```typescript
const [genres, movies] = await Promise.all([
  this.restClient.get<GenreListResponse>('/genre/movie/list'),
  this.restClient.get<DiscoverResponse>('/discover/movie', { params: { page } }),
]);
```

## Variáveis de Ambiente

| Variável | Descrição | Obrigatória |
|---|---|---|
| `TMDB_BASE_URL` | Base URL da TMDB: `https://api.themoviedb.org/3` | Sim |
| `TMDB_API_KEY` | Bearer access token da TMDB | Sim |
| `API_TIMEOUT` | Timeout HTTP em ms (padrão: 5000) | Não |

## Regras

- `RestClient` sempre injetado via abstract class — nunca instanciar `RestClientService` diretamente
- Endpoints são relativos — nunca passar URL completa para `get()` / `post()`
- Chamadas independentes devem ser paralelizadas com `Promise.all`
- Nunca silenciar `ExternalApiException` em repositórios — sempre propagar
- Nunca adicionar lógica de negócio em `RestClientService`
- `RestClientService` é o único lugar que conhece `@nestjs/axios` — nenhum módulo importa `HttpService` diretamente

## O que é Proibido

- Importar `@nestjs/axios` diretamente fora de `shared/http`
- Instanciar `RestClientService` manualmente — usar DI
- Fazer chamadas HTTP fora de repositórios de infraestrutura
- Silenciar `ExternalApiException`
- Adicionar lógica de negócio ou mapeamento de domínio no `RestClientService`
