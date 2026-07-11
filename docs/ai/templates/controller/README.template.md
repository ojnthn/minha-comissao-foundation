# {NomeController}

## Objetivo

Expor os endpoints HTTP do recurso `{recurso}`, recebendo requisições, delegando ao use case correspondente e retornando a resposta.

---

## Responsabilidades

- Receber e deserializar a requisição HTTP
- Delegar 100% da lógica ao use case correspondente
- Documentar rotas via Swagger (`@ApiTags`, `@ApiOperation`, `@ApiResponse`)
- Retornar a resposta HTTP com status correto

> Controller não contém lógica de negócio. É um adaptador entre HTTP e use cases.

---

## Rotas

| Método | Rota | Use Case | Autenticação |
|---|---|---|---|
| `{MÉTODO}` | `/{rota}` | `{NomeUseCase}` | Pública / Protegida |
| `{MÉTODO}` | `/{rota}` | `{NomeUseCase}` | Pública / Protegida |

---

## Fluxo

```
Request HTTP → {NomeController}.{metodo}() → {NomeUseCase}.execute(input)
                                                    ↓
                                          {NomeOutput} → Response HTTP {código}
                                                    ↓ (exceção)
                                          GlobalExceptionFilter → Response de erro
```

---

## Dependências

| Dependência | Token DI | Finalidade |
|---|---|---|
| `{NomeUseCase}` | — | Executar a operação de negócio |
| `@CurrentUser()` | — | Extrair payload JWT do usuário autenticado |

---

## Estrutura interna

```typescript
// presentation/controllers/{nome}.controller.ts

@ApiTags('{nome-do-recurso}')
@Controller('{rota-base}')
export class {Nome}Controller {
  constructor(private readonly {nomeUseCase}: {NomeUseCase}) {}

  @Public()                              // apenas se rota for pública
  @ApiOperation({ summary: '{descrição}' })
  @ApiResponse({ status: {código}, description: '{descrição}' })
  @{MÉTODO}('{sub-rota}')
  async {metodo}(
    @Body() dto: {NomeDto},
    @CurrentUser() user: JwtPayload,    // apenas se rota for protegida
  ): Promise<{NomeOutput}> {
    return this.{nomeUseCase}.execute({
      {campo}: dto.{campo},
      userId: user.sub,
    });
  }
}
```

---

## Como Utilizar

### Registrar no módulo

```typescript
// {module-name}.module.ts
controllers: [{Nome}Controller],
providers: [{NomeUseCase}],
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

### Rota pública

```typescript
@Public()
@Post('auth/register')
async register(@Body() dto: RegisterDto): Promise<RegisterOutput> {
  return this.registerUseCase.execute(dto);
}
```

### Rota protegida com usuário autenticado

```typescript
@Get('profile')
async profile(@CurrentUser() user: JwtPayload): Promise<ProfileOutput> {
  return this.getProfileUseCase.execute({ userId: user.sub });
}
```

---

## Documentação Swagger

| Decorator | Obrigatório | Finalidade |
|---|---|---|
| `@ApiTags('{recurso}')` | Sim (na classe) | Agrupa rotas no Swagger |
| `@ApiOperation({ summary })` | Sim (no método) | Descreve a operação |
| `@ApiResponse({ status, description })` | Sim (no método) | Documenta respostas |
| `@ApiBearerAuth()` | Sim (protegidas) | Indica autenticação Bearer |

---

## Observações

- Controllers nunca acessam repositórios diretamente
- Toda lógica de negócio fica no use case
- `@Public()` é a única forma de isentar uma rota da autenticação global
