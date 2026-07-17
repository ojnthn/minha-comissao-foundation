# Spec: Porcentagem de Comissão

## Módulo
modulo novo

## Objetivo
listar as porcentagens de comissão

## Rota
get - /comissao-porcentagem

## Response (sucesso)
```json
{
    "paginacao": {
        "atual": 1,
        "proxima": null
    },
    "detalhes": [
        {
            "id": 1,
            "descricao": "7%"
        },
        {
            "id": 2,
            "descricao": "2%"
        }
    ]
}
```

## Erros
- {código}: {condição}

## Repositório / Dependências
- Método novo: {assinatura}
- Fonte externa: {endpoint, se houver}

## Regras específicas
- {qualquer regra de negócio que não está no CLAUDE.md do módulo}

## Fora do escopo
- {o que NÃO fazer aqui, evita o agente "ajudar demais"}