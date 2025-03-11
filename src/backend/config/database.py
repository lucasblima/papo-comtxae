import os
import asyncio
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from dotenv import load_dotenv

# Carregar variáveis de ambiente do arquivo .env
load_dotenv()

# Configurações da conexão MongoDB
MONGODB_URL = os.getenv("MONGODB_URL")
if not MONGODB_URL:
    raise ValueError("MONGODB_URL não está configurada no arquivo .env")

DB_NAME = os.getenv("MONGODB_DB_NAME", "papo_comtxae")

# Cliente MongoDB
client: Optional[AsyncIOMotorClient] = None

async def connect_to_mongo():
    """Conectar ao MongoDB."""
    global client
    try:
        client = AsyncIOMotorClient(MONGODB_URL)
        # Ping para verificar se a conexão está funcionando
        await client.admin.command('ping')
        print(f"✅ Conectado ao MongoDB em {MONGODB_URL}")
        return True
    except Exception as e:
        print(f"❌ Erro ao conectar ao MongoDB: {e}")
        return False

async def close_mongo_connection():
    """Fechar conexão com MongoDB."""
    global client
    if client:
        client.close()
        print("Conexão com MongoDB encerrada.")

async def get_database() -> AsyncIOMotorDatabase:
    """Get database instance."""
    if not client:
        await connect_to_mongo()
    return client[DB_NAME]

async def get_collection(collection_name: str):
    """Get collection from database."""
    db = await get_database()
    return db[collection_name]

# Export collections as async functions
async def get_residents_collection():
    return await get_collection("residents")

async def get_requests_collection():
    return await get_collection("requests")

if __name__ == "__main__":
    print("[INFO] Testando conexão com MongoDB...")
    result = asyncio.run(connect_to_mongo())
    print("[OK]" if result else "[ERRO]", "Teste de conexão", "bem-sucedido" if result else "falhou")
