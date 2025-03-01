# Guia de Contribuição

Este documento fornece diretrizes para contribuir com o projeto Papo Social.

## Configuração do Ambiente de Desenvolvimento

### Pré-requisitos
- Python 3.9+
- Node.js 18+
- Git
- MongoDB (local ou Atlas)

### Primeiros Passos

1. Clone o repositório:
   ```bash
   git clone https://github.com/lucasblima/papo-comtxae.git
   cd papo-comtxae
   ```

2. Configure o ambiente de backend:
   ```bash
   cd src/backend
   python -m venv venv
   source venv/Scripts/activate  # Windows/Git Bash
   # OU
   source venv/bin/activate      # Linux/Mac
   pip install -r requirements.txt
   ```

3. Configure o ambiente de frontend:
   ```bash
   cd src/frontend
   npm install
   ```

## Estrutura de Branches

- `main`: Branch estável, contém código de produção
- `dev`: Branch de desenvolvimento
- `feature/nome-da-feature`: Para novas funcionalidades
- `bugfix/nome-do-bug`: Para correções de bugs

## Processo de Contribuição

1. Crie uma branch a partir de `dev`:
   ```bash
   git checkout dev
   git pull
   git checkout -b feature/sua-funcionalidade
   ```

2. Implemente suas mudanças seguindo as diretrizes de código

3. Teste suas alterações:
   - Backend: `pytest`
   - Frontend: `npm test`

4. Faça commit das alterações:
   ```bash
   git add .
   git commit -m "feat: descrição concisa da funcionalidade"
   ```

5. Envie sua branch e crie um Pull Request:
   ```bash
   git push origin feature/sua-funcionalidade
   ```

6. Abra um Pull Request para a branch `dev`

## Padrões de Código

### Python (Backend)
- Seguimos PEP 8
- Docstrings para todas as funções e classes
- Type hints em todos os métodos
- Testes para funcionalidades novas

### TypeScript/JavaScript (Frontend)
- ESLint e Prettier para formatação
- Componentes React com funções nomeadas
- Props tipadas com TypeScript
- Testes para componentes principais

## Mensagens de Commit

Seguimos o padrão Conventional Commits:

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Alterações na documentação
- `style:` - Formatação, ponto-e-vírgula, etc; sem alteração de código
- `refactor:` - Refatoração de código
- `test:` - Adição ou correção de testes
- `chore:` - Alterações no processo de build, ferramentas, etc

## Documentação

Ao adicionar novas funcionalidades, atualize a documentação relevante:

- Documentação de API em `/docs/api/`
- Guias de usuário em `/docs/guides/`
- Alterações arquiteturais em `/docs/architecture/`

## Suporte

Se você tiver dúvidas sobre como contribuir, entre em contato com:
- Lucas Lima (@lucasblima)

## Agradecimentos

Agradecemos antecipadamente pela sua contribuição para tornar o Papo Social uma ferramenta melhor para todos!
