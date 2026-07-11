# {NomeUseCase}

## Objetivo

{Uma frase: o que este use case executa e qual resultado produz.}

> Um use case = uma única ação de negócio. Nada mais.

---

## Responsabilidades

- {Validar pré-condições de negócio antes de executar}
- {Orquestrar chamadas ao repositório}
- {Retornar resultado ou lançar exceção em caso de falha}

---

## Fluxo

```
Controller → {NomeUseCase}.execute(input) → I{Nome}Repository → {resultado | DomainException}
```

### Passos

1. Recebe `{NomeInput}` via `execute()`
2. {Passo de validação ou lógica — ex: verifica se recurso existe}
3. {Passo de persistência ou consulta}
4. {Se condição de falha}: lança `{NomeException}` ({código HTTP})
5. Retorna `{NomeOutput}`

---

## Dependências

| Dependência | Tipo | Token DI |
|---|---|---|
| `I{Nome}Repository` | Interface | `{NOME}_REPOSITORY` |
| `{OutraDependencia}` | {tipo} | `{TOKEN}` |

---

## Estrutura interna

```typescript
// application/use-cases/{acao}.use-case.ts

export interface {Nome}Input {
  {campo}: {tipo};
}

export interface {Nome}Output {
  {campo}: {tipo};
}

@Injectable()
export class {NomeUseCase} {
  constructor(
    @Inject({NOME}_REPOSITORY)
    private readonly {nome}Repository: I{Nome}Repository,
  ) {}

  async execute(input: {Nome}Input): Promise<{Nome}Output> {
    // lógica de negócio aqui
  }
}
```

---

## Como Utilizar

### Registrar como provider no módulo

```typescript
// {module-name}.module.ts
providers: [
  {NomeUseCase},
  { provide: {NOME}_REPOSITORY, useClass: Prisma{Nome}Repository },
]
```

### Injetar no controller

```typescript
constructor(private readonly {nomeUseCase}: {NomeUseCase}) {}

async {metodo}(@Body() dto: {NomeDto}): Promise<{NomeOutput}> {
  return this.{nomeUseCase}.execute(dto);
}
```

---

## Exemplos

### Happy path

```typescript
const output = await useCase.execute({
  {campo}: '{valor}',
});
// output: { {campo}: '{resultado}' }
```

### Falha de negócio

```typescript
// Lança {NomeException} se {condição}
// GlobalExceptionFilter converte para HTTP {código}
```

---

## Observações

- Use cases nunca retornam `null` silenciosamente — lançam exceção ou retornam valor válido
- Use cases nunca acessam `PrismaClient` diretamente — apenas via interface do repositório
- Use cases são sempre `async`, mesmo que internamente síncronos
