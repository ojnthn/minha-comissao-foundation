# {Nome}Service

## Objetivo

{Uma frase: integração com o serviço externo `{nome do serviço}` para {finalidade}.}

---

## Responsabilidades

- {Encapsular a comunicação com a API/serviço externo}
- {Mapear resposta externa para tipos internos do projeto}
- {Isolar detalhes de integração das camadas de domínio e aplicação}

---

## Fluxo

```
UseCase → I{Nome}Service (interface) → {Nome}Service (implementação) → API/serviço externo
                                              ↓
                                    Resposta mapeada para tipo interno
```

---

## Dependências

| Dependência | Finalidade |
|---|---|
| `HttpService` / `{ClienteHTTP}` | Chamada HTTP ao serviço externo |
| `ConfigService` | Acesso a variáveis de ambiente (URL base, API key) |

---

## Estrutura interna

```typescript
// infrastructure/services/{nome}.service.ts

export interface I{Nome}Service {
  {metodo}({param}: {tipo}): Promise<{TipoRetorno}>;
}

@Injectable()
export class {Nome}Service implements I{Nome}Service {
  constructor(
    private readonly http: {ClienteHTTP},
    private readonly config: ConfigService,
  ) {}

  async {metodo}({param}: {tipo}): Promise<{TipoRetorno}> {
    const baseUrl = this.config.get<string>('{namespace}.baseUrl');
    const apiKey = this.config.get<string>('{namespace}.apiKey');
    // chamada HTTP + mapeamento
  }
}
```

---

## Como Utilizar

### Registrar no módulo

```typescript
// {module-name}.module.ts
providers: [
  { provide: I{Nome}Service, useClass: {Nome}Service },
]
```

### Injetar no use case

```typescript
constructor(
  @Inject(I{Nome}Service)
  private readonly {nome}Service: I{Nome}Service,
) {}
```

---

## Exemplos

### Chamada ao serviço externo

```typescript
const resultado = await this.{nome}Service.{metodo}(param);
```

---

## Variáveis de Ambiente

| Variável | Namespace | Obrigatória |
|---|---|---|
| `{VARIAVEL_BASE_URL}` | `{namespace}.baseUrl` | Sim |
| `{VARIAVEL_API_KEY}` | `{namespace}.apiKey` | Sim |

---

## Observações

- Erros da API externa devem ser capturados e convertidos em `DomainException` ou subclasse
- Nunca expor detalhes do serviço externo (tipos gerados pela API, URLs) fora desta classe
- Cache de respostas é responsabilidade de um decorator ou camada separada — não deste service
