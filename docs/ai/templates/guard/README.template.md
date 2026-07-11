# {NomeGuard}

## Objetivo

{Uma frase: protege rotas verificando {condição} antes de permitir o acesso ao handler.}

---

## Responsabilidades

- Verificar {condição de autorização/autenticação}
- Retornar `true` para liberar ou `false`/lançar exceção para bloquear o acesso
- {Verificar metadados de rota — ex: `@Public()` — para sobrescrever comportamento padrão}

---

## Fluxo

```
Request → {NomeGuard}.canActivate() → [libera] → Handler
                                    → [bloqueia] → 401/403 via GlobalExceptionFilter
```

### Passos

1. Lê metadado `{NOME_METADATA_KEY}` via `Reflector` (se aplicável)
2. {Se rota marcada como pública}: retorna `true` sem verificar
3. {Verifica token/permissão via estratégia ou lógica interna}
4. {Se válido}: retorna `true`
5. {Se inválido}: retorna `false` ou lança exceção

---

## Dependências

| Dependência | Finalidade |
|---|---|
| `Reflector` | Leitura de metadados do handler/classe |
| `{NomeStrategy}` | Validação do token JWT (se estender `AuthGuard`) |

---

## Estrutura interna

```typescript
// infrastructure/guards/{nome}.guard.ts

@Injectable()
export class {NomeGuard} extends AuthGuard('{estrategia}') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }
}
```

---

## Como Utilizar

### Registro global (AppModule)

```typescript
{
  provide: APP_GUARD,
  useClass: {NomeGuard},
}
```

> Registrado globalmente — todas as rotas são protegidas por padrão.

### Tornar uma rota pública

```typescript
@Public()
@Post('login')
async login() { ... }
```

---

## Exemplos

### Rota protegida (padrão)

```typescript
@Get('perfil')
async perfil(@CurrentUser() user: JwtPayload) { ... }
// Requer: Authorization: Bearer <token-válido>
```

### Rota pública

```typescript
@Public()
@Post('auth/register')
async register() { ... }
// Não requer token
```

---

## Observações

- Exportado pelo `{NomeModulo}Module` e registrado globalmente pelo `AppModule`
- `@Public()` é a única forma de tornar uma rota acessível sem autenticação
- Nunca adicionar lógica de negócio no guard — apenas verificação de acesso
