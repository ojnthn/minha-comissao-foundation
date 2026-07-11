# {NomeStrategy}

## Objetivo

Definir como o token `{tipo — ex: JWT}` é extraído e validado para popular `request.user` com o payload autenticado.

---

## Responsabilidades

- Extrair o token do contexto HTTP ({ex: header `Authorization: Bearer`})
- Validar o token via `{mecanismo — ex: JwtModule}`
- Retornar o payload para que o guard repasse via `request.user`

---

## Fluxo

```
Request → {NomeGuard} → {NomeStrategy}.validate(payload)
                              ↓
                    { sub, email, ... } → request.user
                              ↓ (inválido)
                    UnauthorizedException → HTTP 401
```

---

## Dependências

| Dependência | Finalidade |
|---|---|
| `PassportStrategy` | Base de todas as strategies do Passport |
| `{Strategy}` (`passport-{tipo}`) | Estratégia de validação do token |
| `ConfigService` | Acesso ao segredo/chave de validação |

---

## Estrutura interna

```typescript
// infrastructure/strategies/{nome}.strategy.ts

@Injectable()
export class {NomeStrategy} extends PassportStrategy(Strategy) {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.secret'),
    });
  }

  validate(payload: { sub: string; email: string }): JwtPayload {
    return { sub: payload.sub, email: payload.email };
  }
}
```

---

## Como Utilizar

### Registrar no módulo

```typescript
// {module-name}.module.ts
providers: [
  {NomeStrategy},
  {NomeGuard},
]
```

### Acessar o payload no controller

```typescript
@Get('perfil')
async perfil(@CurrentUser() user: JwtPayload) {
  return { userId: user.sub };
}
```

---

## Payload retornado

```typescript
interface JwtPayload {
  sub: string;   // UUID do usuário
  email: string; // email do usuário
}
```

---

## Exemplos

### Token válido

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
→ `request.user = { sub: 'uuid', email: 'email@exemplo.com' }`

### Token ausente ou expirado

→ `HTTP 401 Unauthorized`

---

## Observações

- `validate()` é chamado pelo Passport após a verificação do token — nunca chamar manualmente
- Retornar apenas o mínimo necessário no payload (`sub` + `email`)
- Nunca incluir senha ou dados sensíveis no payload JWT
