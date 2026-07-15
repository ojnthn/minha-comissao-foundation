# Módulos

## Módulos Existentes

| Módulo | Status | Responsabilidade |
|---|---|---|
| `auth` | Implementado | Registro e autenticação de usuários com JWT |
| `movies` | Implementado | Listagem de filmes populares via TMDB API |
| `user-config` | Implementado | Preferências de exibição e notificação do usuário autenticado |
| `reviews` | Implementado | Registro de avaliação (nota, "amei", texto, data assistida) de usuário para filme |
| `produtos` | Implementado | CRUD de produtos (chapas de MDF) vinculados a uma comissão percentual padrão |

## Estrutura Interna

```
modules/{module-name}/
├── CONTEXT.md              # contexto do módulo para a IA
├── README.md               # documentação para o desenvolvedor humano
├── domain/
│   ├── entities/           # entidades de domínio
│   ├── repositories/       # interfaces de repositório + tokens
│   └── value-objects/      # value objects com validação (se houver)
├── application/
│   ├── use-cases/          # um arquivo por use case
│   └── dtos/               # DTOs de request HTTP (se houver — módulos sem HTTP input podem omitir)
├── infrastructure/
│   ├── repositories/       # implementações (Prisma ou API externa)
│   ├── guards/             # guards (se necessário)
│   └── strategies/         # strategies do Passport (se necessário)
├── presentation/
│   └── controllers/        # controllers HTTP
└── {module-name}.module.ts
```

## Ordem de Implementação

Ao criar um novo módulo ou feature:

1. Entidade em `domain/entities/`
2. Interface de repositório em `domain/repositories/`
3. Value objects em `domain/value-objects/` (se houver campos com validação própria)
4. DTOs em `application/dtos/`
5. Use cases em `application/use-cases/`
6. Repositório em `infrastructure/repositories/`
7. Controller em `presentation/controllers/`
8. Registrar tudo em `{module-name}.module.ts`

## Registro no Módulo

```typescript
@Module({
  imports: [...],
  controllers: [XController],
  providers: [
    XUseCase,
    {
      provide: X_REPOSITORY,         // token (string constant ou abstract class)
      useClass: PrismaXRepository,   // implementação concreta
    },
  ],
})
export class XModule {}
```

- Exportar apenas o que for necessário para outros módulos (ex: `JwtAuthGuard`, `JwtModule`)
- `PrismaClient` é provider local do módulo que usa banco — nunca global

## Documentação por Módulo

Cada módulo deve conter dois arquivos:

| Arquivo | Público-alvo | Conteúdo |
|---|---|---|
| `CONTEXT.md` | IA | Responsabilidade, use cases, entidades, contratos de API, fluxos, decisões técnicas, o que não fazer |
| `README.md` | Desenvolvedor | Como usar o módulo, como testar, variáveis de ambiente |

Componentes em `src/shared/` **não recebem** `CONTEXT.md` nem `README.md`.

### Seções obrigatórias do CONTEXT.md de módulo

- Responsabilidade
- Escopo (dentro / fora)
- Casos de Uso (tabela: use case, arquivo, rota)
- Entidades de Domínio (campos e invariantes)
- Value Objects (campo e validações — se não houver, declarar explicitamente "Não se aplica")
- Interface do Repositório
- Contrato da API (request/response por endpoint)
- Erros Esperados (exceção, código HTTP, quando ocorre)
- Fluxo de Execução (por use case)
- Limites
- Regras Obrigatórias
- O que é Proibido
- Dependências Permitidas
- Variáveis de Ambiente
- Convenções
- Relação com Outros Componentes
- Decisões Técnicas
- Evolução Futura
- O que NÃO Fazer Neste Módulo

## Critérios de Aceite

### Domínio

- Entidade criada com regras de negócio encapsuladas
- Value objects para campos com validação própria
- Interface de repositório em `domain/repositories/`
- Nenhuma importação de `@nestjs/*`, Prisma ou lib externa no domínio

### Use Case

- Um use case por operação — nunca múltiplas operações no mesmo use case
- Lança `DomainException` (ou subclasse) em falha — nunca retorna `null` silenciosamente
- Não acessa banco diretamente — usa apenas a interface do repositório
- Testado com unit test (repositório mockado)

### Infraestrutura

- Repositório implementa a interface do domínio
- Mapper `toDomain()` entre modelo Prisma e entidade isolado no repositório
- Nenhum tipo Prisma vaza para camadas superiores

### Apresentação

- Controller delega 100% ao use case — sem lógica de negócio
- DTOs com validação via `class-validator`
- Rotas documentadas via Swagger (`@ApiOperation`, `@ApiResponse`, `@ApiTags`, `@ApiSecurity`)

### Qualidade

- Sem erros de TypeScript (`npm run build` sem warnings)
- Lint passando (`npm run lint`)
- Nenhum `any` explícito no código novo
- Variáveis de ambiente novas documentadas no `.env.example`
- Sem `console.log` ou código comentado
