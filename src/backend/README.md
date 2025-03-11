# Papo Social API

API para gestão de associação de moradores desenvolvida com FastAPI e MongoDB.

## Configuração

### Requisitos

- Python 3.9+
- MongoDB (local ou remoto)
- pip (gerenciador de pacotes Python)

### Instalação

1. Clone o repositório
2. Instale as dependências:

```bash
pip install -r requirements.txt
```

3. Configure as variáveis de ambiente (opcional):

```bash
# MongoDB URL
export MONGODB_URL="mongodb://localhost:27017"
# Nome do banco de dados
export DATABASE_NAME="papo_social_db"
```

## Scripts de Execução

### Servidor

Para iniciar o servidor, use o script `run_server.py`:

```bash
# Modo de desenvolvimento (padrão)
python run_server.py --dev

# Modo de teste (com MongoDB mockado)
python run_server.py --test

# Modo de produção
python run_server.py --prod

# Especificar porta e host
python run_server.py --port 5000 --host 0.0.0.0
```

### Testes

Para executar os testes, use o script `run_tests.py`:

```bash
# Todos os testes
python run_tests.py

# Apenas testes de unidade
python run_tests.py --unit

# Apenas testes de integração
python run_tests.py --integration

# Com saída detalhada
python run_tests.py --verbose
```

## API Endpoints

### Healthcheck

- `GET /`: Verifica se a API está online

### Residentes

- `GET /residents/`: Lista todos os residentes
- `POST /residents/`: Cria um novo residente
- `GET /residents/{id}`: Obtém um residente pelo ID

### Solicitações

- `GET /requests/`: Lista todas as solicitações
- `POST /requests/`: Cria uma nova solicitação

### Comandos de Voz

- `POST /voice-command/`: Processa um comando de voz

## Modelos de Dados

### Residente

```json
{
  "name": "Nome Completo",
  "email": "email@exemplo.com",
  "phone": "11987654321",
  "address": "Endereço completo",
  "unit_number": "101A",
  "is_active": true,
  "role": "resident"
}
```

### Solicitação

```json
{
  "title": "Título da solicitação",
  "description": "Descrição detalhada do problema",
  "category": "maintenance",
  "status": "pending",
  "priority": "medium",
  "created_by": "id_do_residente",
}
```

## Desenvolvimento

### Estrutura do Projeto

- `main.py`: Ponto de entrada da aplicação
- `models/`: Modelos de dados Pydantic
- `config/`: Configurações do banco de dados e outras
- `tests/`: Testes automatizados
  - `unit/`: Testes unitários
  - `integration/`: Testes de integração

### MongoDB

A aplicação usa MongoDB via driver assíncrono Motor. Para testes, é usado o `mongomock-motor` para simular o MongoDB sem necessidade de uma instância real.

