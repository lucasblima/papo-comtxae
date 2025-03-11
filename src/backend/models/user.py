from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator, EmailStr
from enum import Enum

class UserRole(str, Enum):
    """Papéis possíveis para um usuário no sistema."""
    ADMIN = "admin"
    RESIDENT = "resident"
    MODERATOR = "moderator"
    ASSOCIATION = "association"

class UserAchievement(BaseModel):
    """Conquistas do usuário."""
    id: str
    name: str
    description: str
    awarded_at: datetime = Field(default_factory=datetime.now)

class UserLevel(BaseModel):
    level: int = 1
    xp: int = 0
    next_level_xp: int = 100
    
    @field_validator("level")
    @classmethod
    def validate_level(cls, v):
        if v < 1:
            return 1
        return v

class UserModel(BaseModel):
    """Modelo para representar um usuário no sistema."""
    
    id: Optional[str] = None
    name: str = Field(..., min_length=2, max_length=100)
    display_name: Optional[str] = Field(None, min_length=2, description="Nome de exibição/apelido")
    email: Optional[EmailStr] = Field(None, description="Email do usuário")
    phone: Optional[str] = Field(None, description="Número de telefone")
    profile_image: Optional[str] = Field(None, description="URL da imagem de perfil")
    age: Optional[int] = Field(None, ge=0, le=120)
    location: Optional[str] = Field(None, max_length=100)
    interests: List[str] = Field(default_factory=list)
    xp: int = Field(default=0, ge=0)
    level: int = Field(default=1, ge=1)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Gamificação
    achievements: List[UserAchievement] = Field(default_factory=list)
    streak_days: int = Field(0, description="Dias consecutivos de uso")
    last_active: datetime = Field(default_factory=datetime.now)
    
    # Associações e comunidades
    associations: List[str] = Field(default_factory=list)
    communities: List[str] = Field(default_factory=list, description="IDs das comunidades")
    
    # Preferências
    preferred_voice: Optional[str] = Field(None, description="Preferência de voz da IA")
    notification_preferences: dict = Field(default_factory=dict)
    
    # Controle
    role: UserRole = Field(default=UserRole.RESIDENT)
    is_active: bool = Field(default=True)
    
    # Métricas de uso
    voice_interactions_count: int = Field(0)
    requests_created_count: int = Field(0)
    votes_count: int = Field(0)
    
    @field_validator('xp')
    @classmethod
    def validate_xp(cls, value: int) -> int:
        """Valida que o XP é um número positivo."""
        if value < 0:
            raise ValueError("XP não pode ser negativo")
        return value
    
    @field_validator('level')
    @classmethod
    def validate_level(cls, value: int) -> int:
        """Valida que o nível é um número positivo maior que zero."""
        if value < 1:
            raise ValueError("Nível deve ser pelo menos 1")
        return value
    
    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "name": "Maria Silva",
                "display_name": "Mari",
                "email": "maria@exemplo.com",
                "phone": "11987654321",
                "age": 32,
                "location": "São Paulo",
                "interests": ["educação", "saúde", "tecnologia"],
                "associations": ["escola_local", "ong_saude"],
                "xp": 120,
                "level": 2,
                "role": "resident",
                "is_active": True
            }
        }
    } 