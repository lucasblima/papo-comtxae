from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, validator
from .bson_types import PydanticObjectId

class RequestModel(BaseModel):
    """Modelo para solicitações/chamados de moradores"""
    
    id: Optional[PydanticObjectId] = Field(default=None, alias="_id")
    title: str
    description: str
    status: str = "pending"  # pending, in_progress, resolved, canceled
    category: str  # maintenance, noise, common_areas, security, etc.
    priority: str = "medium"  # low, medium, high
    created_by: PydanticObjectId
    assigned_to: Optional[PydanticObjectId] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    resolved_at: Optional[datetime] = None
    comments: List[Dict[str, Any]] = []
    
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
    
    @validator("status")
    def validate_status(cls, v):
        allowed_statuses = ["pending", "in_progress", "resolved", "canceled"]
        if v not in allowed_statuses:
            raise ValueError(f"Status deve ser um dos: {', '.join(allowed_statuses)}")
        return v
        
    @validator("priority")
    def validate_priority(cls, v):
        allowed_priorities = ["low", "medium", "high"]
        if v not in allowed_priorities:
            raise ValueError(f"Prioridade deve ser uma das: {', '.join(allowed_priorities)}")
        return v
