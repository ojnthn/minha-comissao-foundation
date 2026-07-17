# Spec: Alteração de contrato - Listagem de pedidos

## Módulo
pedido

## Objetivo
alterar o retorno do contrato da listagem de pedidos

## Rota
/pedidos?porUsuario=true&dataInicio=2026-01-01&dataFim=2026-12-31&page=1&limit=10

- implemente uma ordenacao de ordem = mais antigo | mais novo

## Request
headers: token jwt // irá ser usado para buscar as informacoes do usuario logado

## Response (sucesso)
```json
{
    "pagination": {
        "current": 1,
        "next": null,
    },
    "detalhes": [
        {
            "id": 1,
            "codigo": "#00001",
            "data": "01/01/2001",
            "marceneiro": {
                "id": 1,
                "nome": "Jonas da Marcenaria"
            },
            "vendedor": {
                "id": 1,
                "nome": "Jonathan"
            },
            "valor": {
                "total": "R$ 1.500,00",
                "comissao": "R$ 100,00"
            },
            "produtos": [
                {
                    "id": 2,
                    "nome": "Chapa MDF Branco 15mm",
                    "valor": "R$ 800,00",
                    "porcentagem": "10%"
                }
            ]
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