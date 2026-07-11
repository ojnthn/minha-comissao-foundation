# {NomeProvider}

## Objetivo

Registrar `{recurso}` como provider NestJS para que possa ser injetado em outros componentes do módulo via Dependency Injection.

---

## Responsabilidades

- Configurar e disponibilizar `{recurso}` para injeção de dependência
- {Inicializar conexão / instanciar cliente / fornecer valor de configuração}
- Isolar os detalhes de configuração da infraestrutura

---

## Tipo de Provider

| Forma | Quando usar |
|---|---|
| `useClass` | Substituição de interface por implementação concreta (repositórios, services) |
| `useValue` | Instâncias já configuradas (ex: `new PrismaClient()`) |
| `useFactory` | Criação assíncrona ou que depende de outros providers |

---

## Definição

```typescript
// Forma useClass (repositório)
{
  provide: {NOME}_TOKEN,
  useClass: {NomeImplementacao},
}

// Forma useValue (PrismaClient)
{
  provide: PrismaClient,
  useValue: new PrismaClient(),
}

// Forma useFactory (assíncrono)
{
  provide: {NOME}_TOKEN,
  useFactory: async (config: ConfigService) => {
    return new {NomeClasse}(config.get('{chave}'));
  },
  inject: [ConfigService],
}
```

---

## Dependências

| Token injetado | Classe/Valor | Finalidade |
|---|---|---|
| `{NOME}_TOKEN` | `{NomeImplementacao}` | {Para que é usado} |
| `PrismaClient` | `new PrismaClient()` | Acesso ao banco de dados |

---

## Como Utilizar

### Registrar no módulo

```typescript
// {module-name}.module.ts
@Module({
  providers: [
    {
      provide: {NOME}_TOKEN,
      useClass: {NomeImplementacao},
    },
    {
      provide: PrismaClient,
      useValue: new PrismaClient(),
    },
  ],
})
export class {NomeModulo}Module {}
```

### Injetar em outro componente

```typescript
constructor(
  @Inject({NOME}_TOKEN)
  private readonly {nome}: I{NomeInterface},
) {}
```

---

## Exemplos

### Provider de repositório

```typescript
{ provide: USER_REPOSITORY, useClass: PrismaUserRepository }
```

### Provider de PrismaClient

```typescript
{ provide: PrismaClient, useValue: new PrismaClient() }
```

### Provider de APP_FILTER global

```typescript
{ provide: APP_FILTER, useClass: GlobalExceptionFilter }
```

---

## Observações

- `PrismaClient` não é global — instanciado dentro de cada módulo que precisa de banco
- Tokens de repositório (`USER_REPOSITORY`) são exportados junto à interface do domínio
- Providers globais (`APP_FILTER`, `APP_GUARD`, `APP_INTERCEPTOR`) são registrados apenas no `AppModule`
