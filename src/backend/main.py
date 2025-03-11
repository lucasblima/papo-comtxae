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

# Rotas para usuários
@app.post("/users/", response_model=UserModel, status_code=status.HTTP_201_CREATED)
async def create_user(
    user: UserModel = Body(...),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Cria um novo usuário"""
    users_collection = db["users"]
    
    # Verifica se já existe um usuário com o mesmo email (se fornecido)
    if user.email:
        existing_user = await users_collection.find_one({"email": user.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Já existe um usuário registrado com este email"
            )
    
    # Prepare user data for insertion
    user_data = user.model_dump(exclude={"id"})
    
    # Insert into database
    result = await users_collection.insert_one(user_data)
    
    # Get the created user
    created_user = await users_collection.find_one({"_id": result.inserted_id})
    created_user["id"] = str(created_user.pop("_id"))
    
    # Desbloqueio do achievement "Bem-vindo"
    welcome_achievement = {
        "id": "welcome",
        "name": "Bem-vindo ao Papo Social!",
        "description": "Você criou sua conta e começou sua jornada.",
        "unlocked_at": created_user["created_at"],
        "icon": "🎉"
    }
    
    # Adiciona o achievement se não existir
    if not any(ach.get("id") == "welcome" for ach in created_user.get("achievements", [])):
        await users_collection.update_one(
            {"_id": result.inserted_id},
            {"$push": {"achievements": welcome_achievement}}
        )
        if "achievements" not in created_user:
            created_user["achievements"] = []
        created_user["achievements"].append(welcome_achievement)
    
    return created_user

@app.get("/users/", response_model=List[UserModel])
async def list_users(
    role: Optional[UserRole] = None,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Lista todos os usuários, opcionalmente filtrados por papel"""
    users_collection = db["users"]
    
    # Filtro de papel
    filter_query = {}
    if role:
        filter_query["role"] = role
    
    users = await users_collection.find(filter_query).to_list(1000)
    for user in users:
        user["id"] = str(user.pop("_id"))
    
    return users

@app.get("/users/{user_id}", response_model=UserModel)
async def get_user(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Obtém um usuário pelo ID"""
    users_collection = db["users"]
    
    try:
        object_id = ObjectId(user_id)
        if (user := await users_collection.find_one({"_id": object_id})) is not None:
            user["id"] = str(user.pop("_id"))
            return user
        raise HTTPException(status_code=404, detail=f"Usuário {user_id} não encontrado")
    except Exception as e:
        if "ObjectId" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"ID de usuário inválido: {user_id}"
            )
        logger.error(f"Erro ao buscar usuário: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar usuário: {str(e)}"
        )

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
    created_user["_id"] = str(created_user["_id"])
    
    # Concede a conquista de boas-vindas
    welcome_achievement = {
        "id": "voice_onboarding",
        "name": "Voz Ativa!",
        "description": "Você se apresentou usando sua voz. Bem-vindo ao Papo Social!",
        "unlocked_at": created_user["created_at"],
        "icon": "🎤"
    }
    
    await users_collection.update_one(
        {"_id": result.inserted_id},
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
        
        # Se houve level up, concede uma conquista
        if level_up:
            level_achievement = {
                "id": f"level_{current_level}",
                "name": f"Nível {current_level}!",
                "description": f"Você alcançou o nível {current_level}.",
                "unlocked_at": datetime.now(),
                "icon": "⭐"
            }
            
            await users_collection.update_one(
                {"_id": object_id},
                {"$push": {"achievements": level_achievement}}
            )
        
        # Retorna o usuário atualizado
        updated_user = await users_collection.find_one({"_id": object_id})
        updated_user["_id"] = str(updated_user["_id"])
        
        return updated_user
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato de XP inválido"
        )
    except:
        raise HTTPException(status_code=400, detail="Formato de ID de usuário inválido")

@app.put("/users/{user_id}", response_model=UserModel)
async def update_user(
    user_id: str,
    user_update: Dict[str, Any],
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Atualiza um usuário existente"""
    users_collection = db["users"]
    
    try:
        object_id = ObjectId(user_id)
        user = await users_collection.find_one({"_id": object_id})
        
        if not user:
            raise HTTPException(status_code=404, detail=f"Usuário {user_id} não encontrado")
        
        # Remover campos não atualizáveis
        if "_id" in user_update:
            del user_update["_id"]
        
        # Atualizar campos
        update_result = await users_collection.update_one(
            {"_id": object_id},
            {"$set": {**user_update, "updated_at": datetime.now()}}
        )
        
        if update_result.modified_count == 0:
            return user  # Retorna o usuário original se nada foi modificado
        
        # Retorna o usuário atualizado
        updated_user = await users_collection.find_one({"_id": object_id})
        updated_user["_id"] = str(updated_user["_id"])
        
        return updated_user
        
    except Exception as e:
        if "ObjectId" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"ID de usuário inválido: {user_id}"
            )
        logger.error(f"Erro ao atualizar usuário: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar usuário: {str(e)}"
        )

# Rotas para residentes
@app.post("/residents/", response_model=ResidentModel, status_code=status.HTTP_201_CREATED)
async def create_resident(
    resident: ResidentModel = Body(...),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Cria um novo residente"""
    residents_collection = db["residents"]
    new_resident = await residents_collection.insert_one(resident.model_dump(exclude={"id"}))
    created_resident = await residents_collection.find_one({"_id": new_resident.inserted_id})
    created_resident["id"] = str(created_resident.pop("_id"))
    return created_resident

@app.get("/residents/", response_model=List[ResidentModel])
async def list_residents(db: AsyncIOMotorDatabase = Depends(get_database)):
    """Lista todos os residentes"""
    residents_collection = db["residents"]
    residents = await residents_collection.find().to_list(1000)
    for resident in residents:
        resident["id"] = str(resident.pop("_id"))
    return residents

@app.get("/residents/{resident_id}", response_model=ResidentModel)
async def get_resident(
    resident_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Obtém um residente pelo ID"""
    residents_collection = db["residents"]
    try:
        object_id = ObjectId(resident_id)
        if (resident := await residents_collection.find_one({"_id": object_id})) is not None:
            resident["id"] = str(resident.pop("_id"))
            return resident
        raise HTTPException(status_code=404, detail=f"Resident {resident_id} not found")
    except Exception as e:
        if "ObjectId" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"ID de residente inválido: {resident_id}"
            )
        logger.error(f"Erro ao buscar residente: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar residente: {str(e)}"
        )

# Rotas para solicitações
@app.post("/requests/", response_model=RequestModel, status_code=status.HTTP_201_CREATED)
async def create_request(
    request: RequestModel = Body(...),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Cria uma nova solicitação"""
    requests_collection = db["requests"]
    new_request = await requests_collection.insert_one(request.model_dump(exclude={"id"}))
    created_request = await requests_collection.find_one({"_id": new_request.inserted_id})
    created_request["_id"] = str(created_request["_id"])
    return created_request

@app.get("/requests/", response_model=List[RequestModel])
async def list_requests(
    status: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Lista solicitações, opcionalmente filtradas por status"""
    requests_collection = db["requests"]
    
    # Filtro de status
    filter_query = {}
    if status:
        filter_query["status"] = status
      
    requests = await requests_collection.find(filter_query).to_list(1000)
    for request in requests:
        request["_id"] = str(request["_id"])
    return requests

# Rota para processamento de comandos de voz
@app.post("/voice-command/")
async def process_voice_command(
    command: dict = Body(...),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Processa um comando de voz e retorna uma resposta"""
    text = command.get("text", "")
    user_id = command.get("user_id")
    
    # Processamento simples baseado em palavras-chave
    # Em uma implementação real, usaríamos NLP ou integração com LLM
    response = {"reply": "", "action": None}
    
    text_lower = text.lower()
    
    # Incrementa contador de interações de voz para o usuário, se fornecido
    if user_id:
        try:
            object_id = ObjectId(user_id)
            await db["users"].update_one(
                {"_id": object_id},
                {"$inc": {"voice_interactions_count": 1}}
            )
            
            # Também adiciona um pouco de XP pela interação
            await db["users"].update_one(
                {"_id": object_id},
                {"$inc": {"level.xp": 2}}
            )
        except:
            pass  # Ignora erros de ID inválido
    
    # Processa o comando
    if "listar" in text_lower and "residente" in text_lower:
        response["reply"] = "Vou listar os residentes para você."
        response["action"] = {"type": "navigate", "target": "/residents"}
    elif "nova" in text_lower and ("solicitação" in text_lower or "requisição" in text_lower):
        response["reply"] = "Vou abrir o formulário de nova solicitação."
        response["action"] = {"type": "navigate", "target": "/requests/new"}
    elif "perfil" in text_lower or "meus dados" in text_lower:
        response["reply"] = "Aqui está seu perfil."
        response["action"] = {"type": "navigate", "target": "/profile"}
    elif "ajuda" in text_lower or "como funciona" in text_lower:
        response["reply"] = "Vou mostrar como o Papo Social funciona."
        response["action"] = {"type": "dialog", "content": "help_intro"}
    else:
        response["reply"] = "Desculpe, não entendi o comando. Pode tentar novamente?"
    
    return response

# Adiciona os routers para diferente funcionalidades
app.include_router(user_router)

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
