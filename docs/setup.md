# Papo Social - Setup Guide

## Requisitos

- Node.js 18+
- Python 3.9+
- MongoDB

## Estrutura do Projeto

```
papo-comtxae/
├── src/
│   ├── frontend/     # Next.js frontend
│   └── backend/      # FastAPI backend
├── scripts/         # Scripts de desenvolvimento
└── docs/           # Documentação
```

## Configuração do Ambiente

### Frontend (Next.js)

1. Instale as dependências:
```bash
cd src/frontend
npm install
```

2. Configure as variáveis de ambiente:
```bash
# .env.development
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ENABLE_VOICE_INTERFACE=true

# .env.production
NEXT_PUBLIC_API_URL=https://api.paposocial.com
NEXT_PUBLIC_ENABLE_VOICE_INTERFACE=true
```

### Backend (FastAPI)

1. Crie e ative o ambiente virtual:
```bash
cd src/backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
.\venv\Scripts\activate   # Windows
```

2. Instale as dependências:
```bash
pip install -r requirements.txt
```

3. Configure as variáveis de ambiente:
```bash
# .env.development
MONGODB_URL=mongodb://localhost:27017/paposocial
DEBUG=True

# .env.production
MONGODB_URL=mongodb+srv://...
DEBUG=False
```

## Scripts de Desenvolvimento

Para facilitar o desenvolvimento, use os seguintes scripts:

### Desenvolvimento Local

```bash
# Inicie o backend e frontend simultaneamente
npm run dev

# Inicie apenas o frontend
npm run dev:frontend

# Inicie apenas o backend
npm run dev:backend
```

### Testes

```bash
# Execute todos os testes
npm run test

# Execute testes do frontend
npm run test:frontend

# Execute testes do backend
npm run test:backend
```

## Padrões de Código

- Frontend: Seguimos o padrão do Next.js com TypeScript
- Backend: PEP 8 com tipagem estática
- Commits: Conventional Commits
- Documentação: Markdown com seções claras

## Temas e Componentes

O projeto utiliza DaisyUI para componentes e temas:

- Light Theme: "lemonade"
- Dark Theme: "dim"

### Customização de Temas

Os temas podem ser customizados em `tailwind.config.ts`. 