# CONTEXT — {NomeStrategy}

## Responsabilidade

`{NomeStrategy}` define como o token `{tipo}` é extraído e validado. Retorna o payload que o guard repassa para `request.user`.

---

## Escopo

### Dentro do escopo

- Extração do token do contexto HTTP
- Validação da assinatura e expiração do token
- Retorno do payload mínimo necessário (`sub`, `email`)

### Fora do escopo

- Decisão de liberar ou bloquear acesso — responsabilidade do guard
- Lógica de negócio — strategies são infraestrutura de autenticação
- Extração de dados do `request.user` nos handlers — responsabilidade de `@CurrentUser()`

---

## Limites

- Não acessa banco de dados diretamente — apenas valida o token
- `validate()` retorna apenas o payload mínimo
- Nunca incluir dados sensíveis (senha, hash) no payload retornado

---

## Regras Obrigatórias

- `ignoreExpiration: false` — tokens expirados sempre rejeitados
- Segredo lido via `ConfigService` — nunca `process.env` diretamente
- `validate()` retorna `{ sub, email }` — payload mínimo e consistente com `JwtPayload`
- Registrada como provider no módulo — nunca global diretamente

---

## O que é Proibido

- `ignoreExpiration: true`
- Acessar `PrismaClient` ou repositórios em `validate()`
- Incluir senha ou dados sensíveis no payload
- Lançar exceções de domínio — o Passport lança `UnauthorizedException` automaticamente
- Ler `process.env` diretamente

---

## Dependências Permitidas

| Dependência | Justificativa |
|---|---|
| `PassportStrategy` | Base da strategy |
| `passport-{tipo}` (`Strategy`, `ExtractJwt`) | Mecânica de extração e validação |
| `ConfigService` | Acesso ao segredo JWT |
| `@nestjs/common` (`Injectable`) | Registro como provider |

---

## Dependências Proibidas

- `@prisma/client` ou repositórios
- Use cases ou lógica de negócio
- `process.env` diretamente

---

## Convenções

| Artefato | Localização | Nome |
|---|---|---|
| Strategy | `infrastructure/strategies/{nome}.strategy.ts` | `{Nome}Strategy` (PascalCase + `Strategy`) |

---

## Relação com Outros Componentes

| Componente | Relação |
|---|---|
| `{NomeGuard}` | Usa esta strategy via `AuthGuard('{estrategia}')` |
| `@CurrentUser()` | Extrai o payload preenchido por `validate()` de `request.user` |
| `ConfigService` | Fornece `jwt.secret` para validação da assinatura |
| `{module-name}.module.ts` | Registra a strategy como provider |

---

## Evolução Futura

- Se o payload precisar de mais campos (ex: `role`), adicionar em `validate()` e em `JwtPayload`
- {Extensão prevista}
