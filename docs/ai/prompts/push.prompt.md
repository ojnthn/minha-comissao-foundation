# Prompt — Commit, Merge e Push para Main

## Objetivo

Preparar o projeto para publicação, revisar todas as alterações, gerar um commit de qualidade e realizar o merge para a branch `main`.

A prioridade é preservar a arquitetura, manter a documentação consistente e garantir que nenhuma alteração quebre os padrões do projeto.

---

# Antes de iniciar

Leia obrigatoriamente:

1. `CLAUDE.md`
2. `docs/ai/architecture.md`
3. `docs/ai/modules.md`
4. `docs/ai/templates/registry.md`

Esses documentos representam a fonte de verdade do projeto.

---

# Etapa 1 — Revisão

Antes de qualquer commit:

- Revisar todo o código alterado
- Verificar aderência ao SOLID
- Verificar aderência à Clean Architecture
- Verificar responsabilidades de cada camada
- Verificar nomenclatura (ver `docs/ai/coding-standards.md`)
- Verificar duplicação
- Verificar dependências desnecessárias
- Remover código morto
- Remover logs temporários
- Remover comentários temporários

---

# Etapa 2 — Documentação

Verificar se todos os novos componentes possuem:

- `README.md`
- `CONTEXT.md`

Caso não existam, gerar utilizando os templates em `docs/ai/templates/`.

---

# Etapa 3 — Validação

Garantir que:

- O projeto compila (`npm run build`)
- Os testes passam (`npm run test`)
- Lint está limpo (`npm run lint`)
- Não existem arquivos temporários
- Não existem conflitos de merge
- A documentação está sincronizada

---

# Etapa 4 — Commit

Gerar mensagem de commit seguindo Conventional Commits:

```
feat(auth): add refresh token support
fix(users): prevent duplicate email registration
refactor(logging): simplify interceptor
docs(ai): update template registry
chore(ci): update github actions
```

---

# Etapa 5 — Git

```bash
git status
git add <arquivos específicos>
git commit -m "<mensagem gerada>"
git push origin main
```

Em caso de conflito de merge:
- Interromper o processo
- Listar todos os conflitos
- Sugerir resolução
- Nunca escolher automaticamente uma versão

---

# Etapa 6 — Pós Push

Verificar:
- Branch sincronizada
- Repositório limpo
- Nenhuma alteração pendente

---

# Regras

Nunca:
- `git push --force`
- Sobrescrever histórico
- Ignorar conflitos
- Commitar sem revisão
- `git add .` — sempre adicionar arquivos específicos

Sempre:
- Preservar histórico
- Conventional Commits
- Respeitar a arquitetura e documentação
- Validar o projeto antes do commit
