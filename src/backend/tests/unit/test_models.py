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
        "unit_number": "102A",
        "is_active": True
    }
    
    resident = ResidentModel(**valid_data)
    assert resident.name == valid_data["name"]
    assert resident.email == valid_data["email"]
    assert resident.phone == valid_data["phone"]
    assert resident.address == valid_data["address"]
    assert resident.unit_number == valid_data["unit_number"]
    assert resident.is_active == valid_data["is_active"]
    assert resident.role == "resident"  # default value
    
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
    assert resident.email == minimal_data["email"]
    assert resident.phone == minimal_data["phone"]
    assert resident.address is None
    assert resident.unit_number is None
    assert resident.is_active is True  # default value
    assert resident.role == "resident"  # default value

def test_resident_model_validation_errors():
    """Test that validation errors are raised appropriately."""
    # Test invalid phone number
    with pytest.raises(ValidationError) as exc_info:
        ResidentModel(
            name="Test User",
            email="test@example.com",
            phone="123"  # too short
        )
    assert "phone" in str(exc_info.value)

    # Test invalid email
    with pytest.raises(ValidationError) as exc_info:
        ResidentModel(
            name="Test User",
            email="not-an-email",
            phone="11987654321"
        )
    assert "email" in str(exc_info.value)

    # Test invalid role
    with pytest.raises(ValidationError) as exc_info:
        ResidentModel(
            name="Test User",
            email="test@example.com",
            phone="11987654321",
            role="invalid_role"
        )
    assert "role" in str(exc_info.value) 