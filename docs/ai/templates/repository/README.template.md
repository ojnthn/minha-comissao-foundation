# I{Nome}Repository / Prisma{Nome}Repository

## Objetivo

Definir o contrato de acesso a dados para `{NomeEntidade}` (interface) e fornecer a implementação concreta com Prisma (repositório).

---

## Responsabilidades

- Abstrair o banco de dados para as camadas superiores via interface (OCP, DIP)
- Converter modelos Prisma em entidades de domínio via mapper privado
- Garantir que nenhum tipo Prisma vaze para fora do repositório

---

## Fluxo

```
UseCase → I{Nome}Repository (interface) → Prisma{Nome}Repository (implementação) → PrismaClient → MySQL
                                                   ↓
                                          toDomain(PrismaModel) → {NomeEntidade}
```

---

## Dependências

| Dependência | Camada | Finalidade |
|---|---|---|
| `I{Nome}Repository` | Domain | Contrato da interface |
| `{NomeEntidade}` | Domain | Entidade retornada pelo mapper |
| `PrismaClient` | Infrastructure | Acesso ao banco |

---

## Estrutura interna

### Interface (domain)

```typescript
// domain/repositories/{nome}.repository.interface.ts

export const {NOME}_REPOSITORY = '{NOME}_REPOSITORY';

export interface I{Nome}Repository {
  findById(id: string): Promise<{NomeEntidade} | null>;
  findBy{Campo}({campo}: {tipo}): Promise<{NomeEntidade} | null>;
  save(entity: {NomeEntidade}): Promise<void>;
  // ...
}
```

### Implementação Prisma (infrastructure)

```typescript
// infrastructure/repositories/prisma-{nome}.repository.ts

@Injectable()
export class Prisma{Nome}Repository implements I{Nome}Repository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<{NomeEntidade} | null> {
    const raw = await this.prisma.{model}.findUnique({ where: { id } });
    if (!raw) return null;
    return this.toDomain(raw);
  }

  private toDomain(raw: Prisma{Tipo}): {NomeEntidade} {
    const result = {NomeEntidade}.create({ ...raw });
    if (!result.ok) throw new Error(`Inconsistência no banco: ${result.error} (id=${raw.id})`);
    return result.value;
  }
}
```

---

## Como Utilizar

### Registrar no módulo

```typescript
// {module-name}.module.ts
{
  provide: {NOME}_REPOSITORY,
  useClass: Prisma{Nome}Repository,
},
{
  provide: PrismaClient,
  useValue: new PrismaClient(),
},
```

### Injetar no use case

```typescript
@Inject({NOME}_REPOSITORY)
private readonly {nome}Repository: I{Nome}Repository,
```

---

## Exemplos

### Buscar por ID

```typescript
const entity = await this.{nome}Repository.findById(id);
if (!entity) throw new NotFoundException();
```

### Persistir entidade

```typescript
await this.{nome}Repository.save(entity);
```

---

## Observações

- O mapper `toDomain()` é privado — nunca exposto para camadas superiores
- Se o mapper falhar (dados inconsistentes no banco), lança `Error` com mensagem descritiva incluindo o `id`
- Toda query é feita via `this.prisma.{model}.{método}()` — sem SQL raw
