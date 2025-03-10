import pytest
from models.resident import ResidentModel
from pydantic import ValidationError

def test_resident_model_validation():
    """Test that the ResidentModel correctly validates input data."""
    # Valid resident data
    valid_data = {
        "name": "João Silva",
        "email": "joao@example.com",
        "phone": "11987654321",
        "address": "Rua ABC, 123",
        "is_active": True
    }
    
    resident = ResidentModel(**valid_data)
    assert resident.name == valid_data["name"]
    assert resident.email == valid_data["email"]
    
    # Invalid data should raise validation error
    with pytest.raises(ValidationError):
        ResidentModel(name="", email="invalid-email")

def test_resident_model_optional_fields():
    """Test that optional fields are handled correctly."""
    minimal_data = {
        "name": "Maria Santos",
        "email": "maria@example.com",
        "phone": "11987654321"
    }
    
    resident = ResidentModel(**minimal_data)
    assert resident.name == minimal_data["name"]
    assert resident.is_active == True  # Default value
    assert resident.address is None  # Optional field 