import os
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Body, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from bson import ObjectId  # Mantendo a importação original que funcionava
from typing import List, Optional
import uvicorn

# Adicionar o diretório atual ao PATH para encontrar os módulos
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

from config.database import connect_to_mongo, close_mongo_connection
from config.database import residents_collection, requests_collection
from models.resident import ResidentModel
from models.request import RequestModel

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Conectando ao MongoDB...")
    await connect_to_mongo()
    yield
    # Shutdown
    print("Encerrando conexão com MongoDB...")
    await close_mongo_connection()

app = FastAPI(
    title="Papo Social API",
    description="API para gestão de associação de moradores",
    version="0.1.0",
    lifespan=lifespan
)

# Configurar CORS de forma mais permissiva para desenvolvimento
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite todas as origens em desenvolvimento
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rota de teste/healthcheck
@app.get("/")
async def root():
    return {"status": "online", "message": "Papo Social API está funcionando!"}

# Rotas para residentes
@app.post("/residents/", response_model=ResidentModel, status_code=status.HTTP_201_CREATED)
async def create_resident(resident: ResidentModel = Body(...)):
    new_resident = await residents_collection.insert_one(resident.dict(exclude={"id"}))
    created_resident = await residents_collection.find_one({"_id": new_resident.inserted_id})
    return created_resident

@app.get("/residents/", response_model=List[ResidentModel])
async def list_residents():
    residents = await residents_collection.find().to_list(1000)
    return residents

@app.get("/residents/{resident_id}", response_model=ResidentModel)
async def get_resident(resident_id: str):
    if (resident := await residents_collection.find_one({"_id": ObjectId(resident_id)})) is not None:
        return resident
    raise HTTPException(status_code=404, detail=f"Resident {resident_id} not found")

# Rota para solicitações
@app.post("/requests/", response_model=RequestModel, status_code=status.HTTP_201_CREATED)
async def create_request(request: RequestModel = Body(...)):
    new_request = await requests_collection.insert_one(request.dict(exclude={"id"}))
    created_request = await requests_collection.find_one({"_id": new_request.inserted_id})
    return created_request

@app.get("/requests/", response_model=List[RequestModel])
async def list_requests(status: Optional[str] = None):
    filter_query = {}
    if status:
        filter_query["status"] = status
    
    requests = await requests_collection.find(filter_query).to_list(1000)
    return requests

# Rota para processar entrada de voz
@app.post("/voice-command/")
async def process_voice_command(command: dict = Body(...)):
    text = command.get("text", "")
    
    # Implementação básica de processamento de comandos por voz
    response = {"success": True, "message": "Comando recebido", "processed_text": text}
    
    # Lógica simples de processamento
    if "listar moradores" in text.lower():
        response["action"] = "list_residents"
    elif "nova solicitação" in text.lower():
        response["action"] = "new_request"
    elif "reunião" in text.lower():
        response["action"] = "manage_meeting"
    
    return response

if __name__ == "__main__":
    # Configuração do uvicorn para desenvolvimento
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="debug",
        # Configurações para evitar problemas de HTTP/2
        http="h11",
        workers=1
    )
