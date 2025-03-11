from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, EmailStr, field_validator

class ResidentModel(BaseModel):
    """Modelo para residentes da associação"""
    
    id: Optional[str] = None
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., pattern=r'^\d{10,11}$')
    address: Optional[str] = Field(default=None, max_length=200)
    unit_number: Optional[str] = Field(default=None, max_length=10)
    joined_date: datetime = Field(default_factory=datetime.now)
    is_active: bool = True
    role: str = Field(default="resident")

    @field_validator('role')
    def validate_role(cls, v):
        valid_roles = ["resident", "board_member", "president", "admin"]
        if v not in valid_roles:
            raise ValueError(f"Role must be one of: {', '.join(valid_roles)}")
        return v
    
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
