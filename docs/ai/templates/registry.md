# Template Registry

Índice oficial de templates de documentação do projeto. Consultar antes de criar qualquer componente.

## Regra de Uso

```
1. Identificar o tipo do componente na tabela abaixo
2. Localizar o template em docs/ai/templates/{tipo}/
3. Gerar README.md a partir de README.template.md
4. Gerar CONTEXT.md a partir de CONTEXT.template.md
5. Preencher apenas informações específicas do componente
6. Nunca alterar a estrutura do template durante a geração
```

**Proibido criar `README.md` ou `CONTEXT.md` sem utilizar o template oficial.**

## Registro de Templates

| Tipo | Localização no Projeto | Template |
|---|---|---|
| **Module** | `src/modules/{nome}/{nome}.module.ts` | `docs/ai/templates/module/` |
| **Controller** | `src/modules/{nome}/presentation/controllers/` | `docs/ai/templates/controller/` |
| **Use Case** | `src/modules/{nome}/application/use-cases/` | `docs/ai/templates/use-case/` |
| **DTO** | `src/modules/{nome}/application/dtos/` | `docs/ai/templates/dto/` |
| **Entity** | `src/modules/{nome}/domain/entities/` | `docs/ai/templates/entity/` |
| **Value Object** | `src/modules/{nome}/domain/value-objects/` | `docs/ai/templates/value-object/` |
| **Repository** | `src/modules/{nome}/domain/repositories/` + `infrastructure/repositories/` | `docs/ai/templates/repository/` |
| **Service** | `src/modules/{nome}/infrastructure/services/` | `docs/ai/templates/service/` |
| **Guard** | `src/modules/{nome}/infrastructure/guards/` | `docs/ai/templates/guard/` |
| **Strategy** | `src/modules/{nome}/infrastructure/strategies/` | `docs/ai/templates/strategy/` |
| **Provider** | Declarado em `{nome}.module.ts` | `docs/ai/templates/provider/` |
| **Pipe** | `src/modules/{nome}/application/pipes/` | `docs/ai/templates/pipe/` |

## Estrutura de Cada Template

```
docs/ai/templates/{tipo}/
├── README.template.md    → documentação para desenvolvedores humanos
└── CONTEXT.template.md   → documentação para a IA
```

### README.template.md — seções obrigatórias

- Nome e Objetivo
- Responsabilidades
- Fluxo
- Dependências
- Estrutura interna
- Como utilizar
- Exemplos
- Observações

### CONTEXT.template.md — seções obrigatórias

- Responsabilidade
- Escopo (dentro / fora)
- Limites
- Regras Obrigatórias
- O que é Proibido
- Dependências Permitidas
- Dependências Proibidas
- Convenções
- Relação com Outros Componentes
- Evolução Futura

## Regras de Evolução dos Templates

1. Alterar o template antes de alterar componentes existentes
2. Após alterar um template, revisar todos os componentes do mesmo tipo
3. Nunca criar um padrão diferente em um componente sem atualizar o template
4. Qualquer novo tipo de componente exige criação do template antes da implementação
