# Padrões de Código para o Projeto Papo Social

Este documento define os padrões de código a serem seguidos em todo o repositório do Papo Social, garantindo consistência entre os diferentes componentes do sistema (backend, frontend e componentes em Rust).

## Princípios Gerais

1. **Legibilidade**: O código deve ser facilmente compreensível para outros desenvolvedores
2. **Manutenibilidade**: Preferir abordagens que facilitem a manutenção no longo prazo
3. **Modularidade**: Componentes bem definidos com responsabilidades claras
4. **Consistência**: Seguir os mesmos padrões em todo o código
5. **Testabilidade**: Código escrito de forma que facilite a criação de testes

## Estrutura de Diretórios

```
papo-comtxae/
├── docs/              # Documentação
├── src/               # Código fonte principal
│   ├── frontend/      # Next.js/React
│   │   ├── components/  # Componentes React reutilizáveis
│   │   ├── pages/       # Roteamento do Next.js
│   │   ├── styles/      # Estilos globais e de componentes
│   │   ├── lib/         # Utilidades e funções comuns
│   │   └── public/      # Arquivos estáticos
│   ├── backend/       # FastAPI (Python)
│   │   ├── api/         # Endpoints da API
│   │   ├── models/      # Modelos e esquemas de dados
│   │   ├── services/    # Lógica de negócio
│   │   ├── db/          # Interações com banco de dados
│   │   └── crew/        # Integrações com CrewAI
│   └── rust_core/     # Componentes Rust de alta performance
│       ├── src/         # Código fonte Rust
│       └── bindings/    # Integrações com Python/Node
├── scripts/          # Scripts de utilidade para o projeto
├── tests/            # Testes abrangendo todos os componentes
└── .github/          # Configurações de CI/CD e GitHub Actions
```

## Padrões Específicos por Linguagem

### Python (Backend)

1. **Formatação**:
   - Black para formatação de código
   - isort para ordenação de imports
   - Ruff para linting rápido
   - mypy para verificação de tipos
   
2. **Convenções**:
   - Snake case para nomes de variáveis e funções: `usuario_atual`, `obter_dados`
   - PEP 8 para estilos gerais
   - Docstrings em todas as funções, classes e módulos
   - Type hints em todas as funções

3. **FastAPI**:
   - Agrupar rotas por função/recurso em arquivos separados
   - Usar Pydantic para validação de dados
   - Documentar todos os endpoints com descrições claras

### TypeScript/JavaScript (Frontend)

1. **Formatação**:
   - ESLint + Prettier para linting e formatação
   - Configuração específica para React e TypeScript
   
2. **Convenções**:
   - camelCase para variáveis e funções: `userData`, `getUserData`
   - PascalCase para componentes e classes: `UserProfile`
   - Interfaces com prefixo I: `IUserData`
   
3. **React**:
   - Componentes funcionais com hooks
   - Evitar props drilling (usar Context API ou bibliotecas de gerenciamento de estado)
   - Agrupar componentes relacionados em diretórios
   - Separar lógica de UI de lógica de negócio

### Rust (Componentes de Alta Performance)

1. **Formatação**:
   - `cargo fmt` para formatação de código
   - `cargo clippy` para linting
   
2. **Convenções**:
   - snake_case para funções, variáveis e módulos
   - UpperCamelCase para tipos e traits
   - SCREAMING_SNAKE_CASE para constantes
   
3. **FFI**:
   - Funções expostas para FFI devem ter documentação completa sobre uso
   - Usar tipos primitivos ou definições claras nas interfaces

## Gestão de Dependências

1. **Python**: Poetry para gerenciamento de dependências
2. **JavaScript**: pnpm para reduzir duplicação de módulos
3. **Rust**: Cargo com versões fixas em Cargo.toml

## Testes

1. **Python**: pytest + pytest-cov para cobertura
2. **JavaScript**: Jest para testes unitários, Cypress para testes E2E
3. **Rust**: testes integrados ao cargo

## Documentação

1. **API**: Documentação automática via FastAPI/Swagger
2. **Frontend**: Storybook para componentes de UI
3. **Geral**: Docsify para documentação centralizada

## CI/CD

GitHub Actions para:
1. Lint e verificação de estilo de código
2. Execução de testes automatizados
3. Build e deploy de versões de teste
4. Geração de documentação
