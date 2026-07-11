# Banco de Dados

## Stack

| Tecnologia | Papel |
|---|---|
| MySQL 8.0 | Banco de dados principal |
| Prisma | ORM e gerenciador de migrations |
| phpMyAdmin | Admin web (porta 8080, dev only) |

## Configuração

Namespace: `database` (`src/config/database.config.ts`).

`DATABASE_URL` no formato:

```
# local
mysql://root:root@localhost:3306/moviedb

# Docker Compose (hostname interno)
mysql://root:root@db:3306/moviedb
```

## Schema Prisma

Localizado em `prisma/schema.prisma`.

### Convenções de modelo

- Nome do modelo em `PascalCase` singular: `model User`
- Tabela mapeada em `snake_case` plural via `@@map`: `@@map("users")`
- `createdAt`/`updatedAt` mapeados via `@map("created_at")` / `@map("updated_at")`
- IDs como UUID: `@id @default(uuid())`
- Campos únicos marcados com `@unique`
- Enums em `snake_case` lowercase: `active`, `inactive`, `deleted`

### Modelo atual: User

```prisma
model User {
  id        String     @id @default(uuid())
  name      String
  email     String     @unique
  password  String
  status    UserStatus @default(active)
  createdAt DateTime   @default(now()) @map("created_at")
  updatedAt DateTime   @updatedAt @map("updated_at")

  language                       String   @default("en-US") @map("language")
  region                         String   @default("US") @map("region")
  includeAdult                   Boolean  @default(false) @map("include_adult")
  theme                          String   @default("dark") @map("theme")
  itemsPerPage                   Int      @default(20) @map("items_per_page")
  defaultSortBy                  String   @default("popularity.desc") @map("default_sort_by")
  newReleasesFromFavoriteGenres  Boolean  @default(true) @map("new_releases_from_favorite_genres")
  watchlistUpcomingReminders     Boolean  @default(true) @map("watchlist_upcoming_reminders")

  favoriteGenres      UserFavoriteGenre[]
  streamingProviders  UserStreamingProvider[]

  @@map("users")
}

enum UserStatus {
  active
  inactive
  deleted
}

model UserFavoriteGenre {
  id      String @id @default(uuid())
  userId  String @map("user_id")
  genreId Int    @map("genre_id")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, genreId])
  @@map("user_favorite_genres")
}

model UserStreamingProvider {
  id         String @id @default(uuid())
  userId     String @map("user_id")
  providerId Int    @map("provider_id")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, providerId])
  @@map("user_streaming_providers")
}
```

> Campos de preferência (`language`, `region`, `includeAdult`, `theme`, `itemsPerPage`, `defaultSortBy`, `newReleasesFromFavoriteGenres`, `watchlistUpcomingReminders`) e as tabelas `user_favorite_genres` / `user_streaming_providers` pertencem ao módulo `user-config` — ver `src/modules/user-config/CONTEXT.md`.

## Migrations

- Geradas via `prisma migrate dev` (desenvolvimento)
- Aplicadas via `prisma migrate deploy` (produção/Docker)
- A API aplica `prisma migrate deploy` automaticamente na inicialização via `docker-compose.yml`
- Migrations versionadas em `prisma/migrations/`

## PrismaClient

- Não é global — instanciado como provider dentro de cada módulo que usa banco:
  ```typescript
  { provide: PrismaClient, useValue: new PrismaClient() }
  ```
- Injetado via constructor: `constructor(private readonly prisma: PrismaClient)`

## Padrão de Repositório

- Repositórios em `infrastructure/repositories/`
- Implementam a interface do domínio
- Contêm mapper privado `toDomain(raw: PrismaModel): DomainEntity`
- Mapper reconstrói a entidade via factory method `Entity.create()`
- Se o mapper falhar (inconsistência no banco), lança `Error` com mensagem descritiva

### Exemplo de mapper

```typescript
private toDomain(raw: PrismaUser): User {
  const result = User.create({
    id: raw.id,
    name: raw.name,
    email: raw.email,
    password: raw.password,
    status: raw.status as 'active' | 'inactive' | 'deleted',
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  });
  if (!result.ok) {
    throw new Error(`Inconsistência no banco: ${result.error} (id=${raw.id})`);
  }
  return result.value;
}
```

## Regras

- Nenhum tipo Prisma gerado (`PrismaUser`, etc.) deve vazar para fora do repositório
- Use cases recebem apenas entidades de domínio — nunca tipos Prisma
- Toda query via `this.prisma.{model}.{method}()` — sem SQL raw
- Campos sensíveis (ex: password) armazenados exatamente como recebidos (hash MD5)

## O que é Proibido

- Importar tipos Prisma fora dos repositórios de infraestrutura
- Acessar `PrismaClient` diretamente em use cases ou controllers
- Instanciar `PrismaClient` globalmente — instanciar dentro do módulo
- SQL raw sem necessidade documentada
