---
description: Implementa uma feature a partir de uma spec em docs/specs/
---

Implemente a spec em `docs/specs/$1.md`.

Antes de codar:
1. Leia a spec completa
2. Leia o `CLAUDE.md` do módulo referenciado na spec (`src/{módulo}/CLAUDE.md`)
3. Se a spec conflitar com alguma regra do CLAUDE.md, pare e me avise antes de prosseguir

Implemente seguindo as convenções do CLAUDE.md do módulo (estrutura de camadas, tratamento de erro, padrão de resposta).

Depois de implementar:
1. Rode os testes existentes do módulo, se houver
2. Atualize o `CLAUDE.md` do módulo refletindo a mudança (novo use case, rota, método de repositório)
3. Me dê um resumo do que foi criado/alterado