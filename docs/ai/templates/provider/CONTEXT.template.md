# CONTEXT — {NomeProvider}

## Responsabilidade

Registrar `{recurso}` no container de DI do NestJS, tornando-o injetável em outros componentes do módulo.

---

## Escopo

### Dentro do escopo

- Configurar o binding entre token e implementação
- Inicializar recursos que requerem configuração (conexões, clientes HTTP)

### Fora do escopo

- Lógica de negócio
- Validação de dados
- Tratamento de exceções

---

## Limites

- Provider é uma configuração de módulo — não é uma classe autônoma
- Tokens de repositório são definidos no domínio — não criados no provider
- Providers globais (`APP_FILTER`, `APP_GUARD`, `APP_INTERCEPTOR`) pertencem exclusivamente ao `AppModule`

---

## Regras Obrigatórias

- Token de repositório exportado junto à interface em `domain/repositories/` (DIP)
- `PrismaClient` registrado como `useValue: new PrismaClient()` dentro do módulo — nunca global
- Forma `useFactory` usada apenas quando a construção é assíncrona ou depende de outros providers
- Providers exportados pelo módulo somente se precisarem ser consumidos por outros módulos

---

## O que é Proibido

- Criar tokens de repositório fora do arquivo de interface (`domain/repositories/`)
- Registrar `PrismaClient` globalmente
- Registrar `APP_FILTER`, `APP_GUARD`, `APP_INTERCEPTOR` fora do `AppModule`
- Usar `useValue` com instâncias de classes que deveriam ser gerenciadas pelo DI do NestJS

---

## Dependências Permitidas

| Token | Quando usar |
|---|---|
| `APP_FILTER` | Apenas no `AppModule` — filtro global |
| `APP_GUARD` | Apenas no `AppModule` — guard global |
| `APP_INTERCEPTOR` | Apenas no `AppModule` — interceptor global |
| `{NOME}_REPOSITORY` | Por módulo — binding interface → implementação Prisma |
| `PrismaClient` | Por módulo — instância de acesso ao banco |

---

## Dependências Proibidas

- Providers não importam de outros módulos — pertencem ao módulo onde são declarados
- Nenhum provider de módulo específico deve ser registrado no `AppModule` (exceto globais)

---

## Convenções

| Tipo | Token | useClass / useValue |
|---|---|---|
| Repositório | `{NOME}_REPOSITORY` | `Prisma{Nome}Repository` |
| Banco | `PrismaClient` | `new PrismaClient()` |
| Filtro global | `APP_FILTER` | `GlobalExceptionFilter` |
| Guard global | `APP_GUARD` | `JwtAuthGuard` |
| Interceptor global | `APP_INTERCEPTOR` | `LoggingInterceptor` |

---

## Relação com Outros Componentes

| Componente | Relação |
|---|---|
| `{module-name}.module.ts` | Local onde o provider é declarado |
| `I{Nome}Repository` | Interface que define o token injetado |
| `Prisma{Nome}Repository` | Implementação concreta registrada via `useClass` |
| Use cases | Recebem a dependência via `@Inject({NOME}_REPOSITORY)` |

---

## Evolução Futura

- Trocar implementação (ex: Prisma → outro ORM): alterar apenas o `useClass` do provider — use cases não mudam (OCP)
- {Extensão prevista}
