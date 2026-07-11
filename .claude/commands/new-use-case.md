---
description: Cria um novo use case seguindo o CLAUDE.md do módulo
---

Crie o use case `$1` no módulo `$2`, seguindo o `CLAUDE.md` do módulo em `src/$2/CLAUDE.md`.

Antes de implementar, leia o `CLAUDE.md` do módulo para entender:
- Convenções de nomenclatura e estrutura de pastas
- Padrão de tratamento de erros do módulo
- Padrão de mapeamento de resposta (camelCase → snake_case, se aplicável)
- Regras de dependência entre camadas (domain/application/infrastructure/presentation)

Detalhes da tarefa:
$ARGUMENTS

Depois de implementar:
1. Atualize o `CLAUDE.md` do módulo refletindo o novo use case, rota e métodos de repositório adicionados
2. Confirme que nenhuma regra de "O que é Proibido" do módulo foi violada