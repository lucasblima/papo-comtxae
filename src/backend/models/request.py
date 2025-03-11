from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator
from .bson_types import PydanticObjectId

class RequestModel(BaseModel):
    """Modelo para solicitações/chamados de moradores"""
    
    id: Optional[PydanticObjectId] = Field(default=None, alias="_id")
    title: str = Field(..., min_length=3, max_length=100)
    description: str = Field(..., min_length=10)
    status: str = Field(default="pending")
    category: str  # maintenance, noise, common_areas, security, etc.
    priority: str = Field(default="medium")
    created_by: PydanticObjectId
    assigned_to: Optional[PydanticObjectId] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    comments: List[Dict[str, Any]] = []
    
    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        valid_statuses = ["pending", "in_progress", "resolved", "cancelled"]
        if v not in valid_statuses:
            raise ValueError(f"Status must be one of: {', '.join(valid_statuses)}")
        return v
    
    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: str) -> str:
        valid_priorities = ["low", "medium", "high", "urgent"]
        if v not in valid_priorities:
            raise ValueError(f"Priority must be one of: {', '.join(valid_priorities)}")
        return v
    
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
