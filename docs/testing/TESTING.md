# Testing Guide for Papo Social

Este guia descreve a estratégia de testes e implementação para o projeto Papo Social.

## Estrutura de Testes

### Backend (FastAPI)

```
src/backend/tests/
├── unit/               # Testes unitários
│   ├── test_models.py  # Testes dos modelos de dados
│   └── test_utils.py   # Testes de utilidades
├── integration/        # Testes de integração
│   ├── test_api.py     # Testes de endpoints da API
│   └── test_db.py      # Testes de integração com banco de dados
├── conftest.py        # Configurações e fixtures do pytest
└── __init__.py
```

### Frontend (Next.js)

```
src/frontend/
├── __tests__/          # Testes unitários e de componentes
│   ├── components/     # Testes de componentes React
│   └── pages/         # Testes de páginas Next.js
├── cypress/           # Testes end-to-end
│   └── e2e/          # Testes E2E com Cypress
├── jest.config.js     # Configuração do Jest
└── jest.setup.js      # Setup do ambiente de testes
```

## Executando os Testes

### Backend

```bash
# Executar todos os testes
cd src/backend
pytest

# Executar testes com cobertura
pytest --cov=app

# Executar testes específicos
pytest tests/unit/test_models.py
pytest tests/integration/test_api.py
```

### Frontend

```bash
# Executar testes unitários
cd src/frontend
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes E2E com Cypress
npm run cypress:open  # Interface gráfica
npm run cypress:run   # Linha de comando
```

## Ambientes de Teste

### Desenvolvimento
- URL da API: http://localhost:8000
- Frontend: http://localhost:3000
- Banco de dados: MongoDB local

### Produção
- URL da API: https://api.paposocial.com
- Frontend: https://paposocial.com
- Banco de dados: MongoDB Atlas

## Padrões de Teste

### Backend

1. **Testes de Modelos**
   - Validação de dados
   - Campos obrigatórios
   - Tipos de dados
   - Relacionamentos

2. **Testes de API**
   - Status codes corretos
   - Formato de resposta
   - Validação de entrada
   - Tratamento de erros

3. **Testes de Banco de Dados**
   - CRUD operations
   - Queries complexas
   - Índices
   - Transações

### Frontend

1. **Testes de Componentes**
   - Renderização correta
   - Interatividade
   - Props e estado
   - Eventos

2. **Testes de Páginas**
   - Rotas
   - SEO
   - Layout
   - Responsividade

3. **Testes E2E**
   - Fluxos de usuário
   - Navegação
   - Formulários
   - Integrações

## Melhores Práticas

1. **Organização**
   - Um arquivo de teste por componente/módulo
   - Nomes descritivos para testes
   - Agrupar testes relacionados

2. **Cobertura**
   - Mínimo de 80% de cobertura
   - Foco em código crítico
   - Testes de edge cases

3. **Manutenção**
   - Atualizar testes com mudanças de código
   - Remover testes obsoletos
   - Documentar casos especiais

## CI/CD

Os testes são executados automaticamente:
- Em cada pull request
- Antes de deploy para produção
- Diariamente nos ambientes de staging

## Troubleshooting

### Problemas Comuns

1. **Testes Falhos**
   - Verificar ambiente
   - Limpar cache
   - Atualizar dependências

2. **Testes Lentos**
   - Usar mocks apropriados
   - Otimizar setup/teardown
   - Paralelizar execução

3. **Testes Instáveis**
   - Identificar condições de corrida
   - Ajustar timeouts
   - Melhorar isolamento

## Recursos

- [Documentação do Jest](https://jestjs.io/docs/getting-started)
- [Documentação do pytest](https://docs.pytest.org)
- [Documentação do Cypress](https://docs.cypress.io)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro) 