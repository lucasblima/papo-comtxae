# Getting Started with Papo ComTxAE

## Requisitos

- Node.js 18+
- Python 3.9+
- Rust 1.70+ (para componentes de performance)
- NPM ou Yarn

## Configuração do Ambiente

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/papo-comtxae.git
cd papo-comtxae
```

2. Instale as dependências JavaScript:
```bash
npm install
```

3. Instale as dependências Python:
```bash
pip install -r requirements.txt
```

4. Instale o Rust e as ferramentas necessárias (opcional para MVP1):
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
# Para Windows, baixe o instalador de https://rustup.rs/
```

5. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto com:
```
PORT=3000
NODE_ENV=development
PYTHON_PATH=/caminho/para/python
# Adicione outras variáveis necessárias
```

## Executando o Projeto

### Servidor Principal
```bash
npm run dev
```

### Componentes Rust (quando implementados)
```bash
cd src/rust_core
cargo build --release
```

### Servidor de Documentação
```bash
npm run docs
```

## Estrutura do Projeto

- `/src/frontend`: Código-fonte Next.js/React
- `/src/backend`: API FastAPI em Python
- `/src/rust_core`: Componentes críticos em Rust
- `/public`: Arquivos estáticos 
- `/docs`: Documentação do projeto
- `/utils`: Utilitários diversos

## Testes

Execute os testes com:
```bash
# JavaScript/TypeScript
npm test

# Python
pytest

# Rust
cd src/rust_core && cargo test
```

Se preferir uma cobertura detalhada:
```bash
npm run test:coverage
