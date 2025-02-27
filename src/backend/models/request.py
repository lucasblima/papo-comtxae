from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from .bson_types import PydanticObjectId

class RequestModel(BaseModel):
    """Modelo para solicitações/demandas dos moradores"""
    
    id: Optional[PydanticObjectId] = Field(default=None, alias="_id")
    title: str
    description: str
    status: str = "pending"  # pending, in_progress, resolved, rejected
    category: str  # maintenance, security, noise, common_areas, etc
    priority: str = "medium"  # low, medium, high, urgent
    created_by: PydanticObjectId
    assigned_to: Optional[PydanticObjectId] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    resolved_at: Optional[datetime] = None
    comments: List[dict] = []
    
    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "title": "Vazamento na garagem",
                "description": "Há um vazamento de água próximo à vaga 15",
                "category": "maintenance",
                "priority": "high",
                "created_by": "6079d5c3b98f5a8e7a51a973"
            }
        }
    }
