"""Módulo principal da API FastAPI."""
import os
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Body, Depends, status, Query
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorDatabase, AsyncIOMotorClient
from bson import ObjectId
from typing import List, Optional, Any, Dict, Union
import uvicorn
from datetime import datetime
from dotenv import load_dotenv
import logging
from pymongo.errors import ConnectionFailure, PyMongoError

# Adicionar o diretório atual ao PATH para encontrar os módulos
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

from config.database import connect_to_mongo, close_mongo_connection, get_database as _get_database
from models.resident import ResidentModel
from models.request import RequestModel
from models.user import UserModel, UserRole, UserAchievement, UserLevel

# Importar rotas modulares
from routes.user_routes import router as user_router

# Carrega as variáveis de ambiente
load_dotenv()

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("papo_social_api")

# MongoDB configuration
MONGODB_URL = os.getenv("MONGODB_URL")
if not MONGODB_URL:
    logger.error("MONGODB_URL não está configurado")
    raise ValueError("MONGODB_URL não está configurado")

# Determina o banco de dados baseado no ambiente
NODE_ENV = os.getenv("NODE_ENV", "development")
if NODE_ENV == "production":
    DATABASE_NAME = os.getenv("DATABASE_NAME", "papo_comtxae")
elif NODE_ENV == "test":
    DATABASE_NAME = os.getenv("TEST_DATABASE_NAME", "papo_comtxae_test")
else:
    DATABASE_NAME = os.getenv("DEV_DATABASE_NAME", "papo_comtxae_dev")

logger.info(f"Usando banco de dados: {DATABASE_NAME} em ambiente: {NODE_ENV}")

# MongoDB client
mongodb_client: Optional[AsyncIOMotorClient] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Gerenciador de contexto para início e término da aplicação.
    Inicializa e fecha conexão com MongoDB.
    """
    # Código executado na inicialização
    global mongodb_client
    logger.info(f"Iniciando conexão com MongoDB: {MONGODB_URL[:20]}...")
    
    mongodb_client = AsyncIOMotorClient(MONGODB_URL)
    try:
        # Verificar conexão
        await mongodb_client.admin.command("ping")
        logger.info("Conexão com MongoDB estabelecida com sucesso!")
    except ConnectionFailure as e:
        logger.error(f"Falha ao conectar ao MongoDB: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Não foi possível conectar ao banco de dados"
        )
    
    yield  # Aqui a aplicação executa
    
    # Código executado no encerramento
    if mongodb_client:
        logger.info("Fechando conexão com MongoDB...")
        mongodb_client.close()
        logger.info("Conexão fechada")

# Initialize FastAPI app
app = FastAPI(
    title="Papo Social API",
    description="API para gestão de associação de moradores",
    version="0.1.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get database instance
async def get_database():
    if mongodb_client is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Conexão com o banco de dados não está disponível"
        )
    return mongodb_client[DATABASE_NAME]

# Rota de teste/healthcheck
@app.get("/")
async def root():
    return {"status": "online", "message": "Papo Social API está funcionando!"}

# Special routes for voice onboarding
@app.post("/onboarding/voice", response_model=UserModel)
async def create_user_from_voice(
    voice_data: dict = Body(...),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Cria um usuário baseado na interação de voz inicial.
    Espera um objeto com:
    - transcript: a transcrição do áudio do usuário
    - audio_metrics: dados de áudio como tom, volume, etc. (opcional)
    """
    transcript = voice_data.get("transcript", "").strip()
    
    if not transcript:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="A transcrição não pode estar vazia"
        )
    
    # Extrai um nome da transcrição - simplificado para este exemplo
    # Em produção, usaríamos NLP mais avançado
    name_words = []
    
    # Algumas frases-chave que as pessoas podem usar ao se apresentar
    intro_phrases = [
        "meu nome é", "me chamo", "sou", 
        "me chame de", "pode me chamar de"
    ]
    
    lower_transcript = transcript.lower()
    
    # Procura por frases de introdução
    for phrase in intro_phrases:
        if phrase in lower_transcript:
            # Pega o texto após a frase de introdução
            potential_name = lower_transcript.split(phrase, 1)[1].strip()
            # Pega apenas as primeiras palavras (até 3)
            name_words = potential_name.split()[:3]
            break
    
    # Se não encontrou nenhuma frase de introdução, usa as primeiras palavras
    if not name_words and len(transcript.split()) > 0:
        name_words = transcript.split()[:2]  # Assume que as primeiras palavras são o nome
    
    # Formata o nome encontrado
    extracted_name = " ".join(name_words).strip()
    
    # Se ainda não temos um nome, usa um valor padrão
    if len(extracted_name) < 2:
        extracted_name = "Novo Usuário"
    
    # Cria um objeto de usuário
    new_user = UserModel(
        name=extracted_name.title(),  # Capitaliza o nome
        display_name=extracted_name.title(),
        voice_interactions_count=1
    )
    
    # Insere no banco de dados
    users_collection = db["users"]
    user_data = new_user.model_dump(exclude={"id"})
    result = await users_collection.insert_one(user_data)
    
    # Recupera o usuário criado
    created_user = await users_collection.find_one({"_id": result.inserted_id})
    created_user["id"] = str(created_user.pop("_id"))
    
    # Concede a conquista de boas-vindas
    welcome_achievement = {
        "id": "voice_onboarding",
        "name": "Voz Ativa!",
        "description": "Você se apresentou usando sua voz. Bem-vindo ao Papo Social!",
        "unlocked_at": created_user["created_at"],
        "icon": "🎤"
    }
    
    await users_collection.update_one(
        {"_id": ObjectId(created_user["id"])},
        {"$push": {"achievements": welcome_achievement}}
    )
    
    if "achievements" not in created_user:
        created_user["achievements"] = []
    created_user["achievements"].append(welcome_achievement)
    
    return created_user

@app.put("/users/{user_id}/xp", response_model=UserModel)
async def add_user_xp(
    user_id: str,
    xp_data: dict = Body(...),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Adiciona XP ao usuário e atualiza seu nível"""
    users_collection = db["users"]
    
    try:
        xp_amount = int(xp_data.get("xp", 0))
        if xp_amount <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A quantidade de XP deve ser um número positivo"
            )
        
        object_id = ObjectId(user_id)
        user = await users_collection.find_one({"_id": object_id})
        
        if not user:
            raise HTTPException(status_code=404, detail=f"Usuário {user_id} não encontrado")
        
        # Extrai os dados de nível atuais
        current_level = user.get("level", {}).get("level", 1)
        current_xp = user.get("level", {}).get("xp", 0)
        next_level_xp = user.get("level", {}).get("next_level_xp", 100)
        
        # Calcula o novo XP e verifica se houve level up
        new_xp = current_xp + xp_amount
        level_up = False
        
        # Fórmula simples de level up: cada nível precisa de 10% mais XP que o anterior
        while new_xp >= next_level_xp:
            current_level += 1
            new_xp -= next_level_xp
            next_level_xp = int(next_level_xp * 1.1)  # 10% a mais para o próximo nível
            level_up = True
        
        # Atualiza os dados do usuário
        await users_collection.update_one(
            {"_id": object_id},
            {"$set": {
                "level.level": current_level,
                "level.xp": new_xp,
                "level.next_level_xp": next_level_xp
            }}
        )
        
        # Busca o usuário atualizado
        updated_user = await users_collection.find_one({"_id": object_id})
        updated_user["id"] = str(updated_user.pop("_id"))
        
        return updated_user
        
    except Exception as e:
        logger.error(f"Erro ao adicionar XP: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao adicionar XP: {str(e)}"
        )

# Adiciona os routers para diferente funcionalidades
app.include_router(user_router, prefix="/api")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="debug",
        http="h11",
        workers=1
    )
