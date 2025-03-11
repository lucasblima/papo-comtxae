"""Configurações para testes."""
import os
import sys
import pytest
import logging
from fastapi.testclient import TestClient
from bson import ObjectId
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure

# Adiciona o diretório raiz ao path para importações
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Carrega as variáveis de ambiente
load_dotenv()

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger("papo_social_tests")

# Força o ambiente de teste
os.environ["NODE_ENV"] = "test"

from main import app, get_database

# Determina se deve usar mongomock ou MongoDB real
USE_MOCK_MONGODB = os.environ.get("USE_MOCK_MONGODB", "0") == "1"

# URL do MongoDB para testes
TEST_MONGODB_URL = os.environ.get("MONGODB_URL")
if not TEST_MONGODB_URL and not USE_MOCK_MONGODB:
    logger.warning("MONGODB_URL não configurado. Usando mongomock.")
    USE_MOCK_MONGODB = True

# Nome do banco de dados para testes
TEST_DATABASE = os.environ.get("TEST_DATABASE_NAME", "papo_comtxae_test")

if USE_MOCK_MONGODB:
    logger.info("Usando mongomock para testes")
    from mongomock_motor import AsyncMongoMockClient
    
    # Cliente e database mock
    async def get_test_database():
        """Retorna database mockada para testes."""
        client = AsyncMongoMockClient()
        return client[TEST_DATABASE]
else:
    logger.info(f"Usando MongoDB real para testes: {TEST_MONGODB_URL} - DB: {TEST_DATABASE}")
    
    # Cliente e database real
    async def get_test_database():
        """Retorna database real para testes."""
        client = AsyncIOMotorClient(TEST_MONGODB_URL)
        try:
            # Verifica se a conexão está funcionando
            await client.admin.command("ping")
            logger.info("Conectado ao MongoDB de teste com sucesso!")
        except ConnectionFailure as e:
            logger.error(f"Servidor MongoDB não disponível: {e}")
            pytest.fail("Servidor MongoDB não disponível")
        
        return client[TEST_DATABASE]

# Dependência para database nos testes
# Sobrescreve a dependência na aplicação
app.dependency_overrides = {
    get_database: get_test_database
}

@pytest.fixture
def test_client():
    """Client para testes de API."""
    with TestClient(app) as client:
        yield client

@pytest.fixture(autouse=True)
async def setup_test_db():
    """Prepara o banco de dados para testes."""
    test_db = await get_test_database()
    
    # Limpa coleções antes do teste
    collections = ["residents", "requests", "users"]
    for collection_name in collections:
        collection = test_db[collection_name]
        await collection.delete_many({})
    
    logger.info(f"Banco de dados de teste inicializado: {TEST_DATABASE}")
    yield
    
    # Limpeza após os testes
    logger.info("Limpando dados de teste...")
    for collection_name in collections:
        collection = test_db[collection_name]
        await collection.delete_many({}) 