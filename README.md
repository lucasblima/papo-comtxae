# Papo Social

Aplicação de rede social com assistente de voz integrado.

## Requisitos

- Node.js 18+
- Python 3.9+
- MongoDB

## Estrutura do Projeto

- `src/frontend`: Aplicação Next.js/React com DaisyUI
- `src/backend`: API FastAPI conectada ao MongoDB

## Configuração

### Backend

1. Copie o arquivo de exemplo de variáveis de ambiente:
   ```
   cd src/backend
   cp .env.example .env
   ```

2. Edite o arquivo `.env` com suas credenciais do MongoDB:
   ```
   MONGODB_URL=mongodb+srv://seu_usuario:sua_senha@seu_cluster.mongodb.net/seu_database?retryWrites=true&w=majority
   MONGODB_DB_NAME=papo_social_db
   PORT=8000
   ```

3. Instale as dependências:
   ```
   pip install -r requirements.txt
   ```

### Frontend

1. Instale as dependências:
   ```
   cd src/frontend
   npm install
   ```

## Executando o Projeto

### Ambos (Frontend e Backend)

```
npm run dev
```

### Apenas Frontend

```
npm run dev:frontend
```

### Apenas Backend

```
npm run dev:backend
```

## Testes

### Executar todos os testes

```
npm run test
```

### Apenas testes do Frontend

```
npm run test:frontend
```

### Apenas testes do Backend

```
npm run test:backend
```

## Documentação
- [Documentação Online](https://lucasblima.github.io/papo-comtxae)
- [Documentação Local](./docs/README.md)

## Arquitetura Híbrida

O Papo Social utiliza uma arquitetura híbrida que combina:
- **Python** (FastAPI) para a API principal e orquestração de IA com CrewAI
- **TypeScript/Next.js** para o frontend interativo
- **Componentes Rust** para processamento de alta performance

## Configuração do Ambiente

### Requisitos

- Python 3.9 ou superior
- Node.js 18 ou superior
- MongoDB Atlas (conta já configurada)

### Instalação

1. **Configure o ambiente Python e instale as dependências**:

   ```bash
   python setup.py
   ```

   Este script vai:
   - Criar um ambiente virtual Python
   - Instalar todas as dependências do backend
   - Verificar a configuração do frontend

2. **Configure o ambiente do frontend**:

   ```bash
   node frontend_setup.js
   ```

   Este script vai:
   - Criar a estrutura de diretórios necessária
   - Configurar o package.json e outras configurações
   - Instalar dependências do Next.js e React

### Configuração do Banco de Dados

A configuração do MongoDB Atlas já está definida no arquivo `.env`. Se necessário atualize:

## Uso Rápido (Windows)

### Iniciar Servidor de Documentação
```bash
# Via script de projeto
./start-project.sh
# Opção 1) Iniciar servidor de documentação

# OU diretamente
docsify serve docs
```

## Contribuição

Veja nosso [Guia de Contribuição](./docs/CONTRIBUTING.md) para detalhes sobre como participar do desenvolvimento.

## Estrutura
```
papo-comtxae/
├── docs/              # Documentação
├── src/               # Código fonte (futuro)
│   ├── frontend/      # Next.js/React
│   ├── backend/       # FastAPI (Python) 
│   └── rust_core/     # Componentes Rust
└── README.md          # Este arquivo
```

## Licença

Este projeto é privado e proprietário.
