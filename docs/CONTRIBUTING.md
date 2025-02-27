# Guia de Contribuição

Obrigado pelo interesse em contribuir com o Papo Social! Este documento fornece as diretrizes para contribuir com nosso projeto.

## Fluxo de Trabalho

1. **Fork** o repositório
2. Crie uma **branch** para sua feature (`git checkout -b feature/amazing-feature`)
3. **Commit** suas mudanças (`git commit -m 'Add: amazing feature'`)
4. **Push** para a branch (`git push origin feature/amazing-feature`)
5. Abra um **Pull Request**

## Convenções de Código

### Python (Backend)
- Python 3.9+ com tipagem
- Black para formatação
- isort para imports
- Docstrings no estilo Google
- Testes com pytest

### TypeScript (Frontend)
- TypeScript com regras estritas
- Prettier e ESLint configurados
- React/Next.js best practices

### Rust (Componentes de Performance) 
- Seguir Rust idiomático
- rustfmt para formatação
- clippy para lint
- Documentação com rustdoc

### Geral
- Comentários em português para facilitar colaboração local
- Mensagens de commit seguindo [Conventional Commits](https://www.conventionalcommits.org/)
- Feature flags para funcionalidades em desenvolvimento

## Testes

- Escreva testes para suas funcionalidades
- Mantenha a cobertura de testes existente 
- Execute `npm test` / `pytest` / `cargo test` antes de submeter um PR

## Documentação

- Atualize a documentação relevante
- Documente APIs com formato apropriado à linguagem
- Mantenha os diagramas atualizados
- Atualize o TECH_STACK.md quando adicionar dependências

## Revisão de Código

- Cada PR requer pelo menos uma revisão
- Mantenha PRs pequenos e focados
- Responda aos comentários de revisão

## Onde Começar

1. Issues marcadas com `good first issue`
2. Melhorias de documentação
3. Adicionar testes
4. Refatoração para melhorar performance

## Comunicação

- Use issues do GitHub para discussões relacionadas ao código
- Para discussões mais amplas, entre em contato [email@exemplo.com]
