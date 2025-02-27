from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, EmailStr
from .bson_types import PydanticObjectId

class ResidentModel(BaseModel):
    """Modelo para residentes da associação"""
    
    id: Optional[PydanticObjectId] = Field(default=None, alias="_id")
    name: str
    email: EmailStr
    phone: str
    address: str
    unit_number: str
    joined_date: datetime = Field(default_factory=datetime.now)
    is_active: bool = True
    role: str = "resident"  # resident, board_member, president, etc.
    
    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "name": "João Silva",
                "email": "joao@exemplo.com",
                "phone": "11999998888",
                "address": "Rua Principal",
                "unit_number": "102A",
                "role": "resident"
            }
        }
    }
