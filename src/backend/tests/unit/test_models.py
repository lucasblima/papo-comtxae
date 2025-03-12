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

# Adicionar testes para UserModel
def test_user_model_xp_validation():
    """Test XP and level validations for UserModel."""
    # Test valid cases
    user = UserModel(name="Test", xp=100, level=1)
    assert user.xp == 100
    assert user.level == 1

    # Test negative XP
    with pytest.raises(ValidationError) as exc_info:
        UserModel(name="Test", xp=-1)
    assert "xp" in str(exc_info.value)

    # Test invalid level
    with pytest.raises(ValidationError) as exc_info:
        UserModel(name="Test", level=0)
    assert "level" in str(exc_info.value)

def test_user_model_achievements():
    """Test achievement handling in UserModel."""
    # Test adding valid achievements
    achievements = [
        {"id": "first_voice", "name": "First Voice", "completed": True},
        {"id": "early_adopter", "name": "Early Adopter", "completed": False}
    ]
    user = UserModel(name="Test", achievements=achievements)
    assert len(user.achievements) == 2
    assert user.achievements[0]["id"] == "first_voice"

    # Test invalid achievement format
    with pytest.raises(ValidationError) as exc_info:
        UserModel(name="Test", achievements=[{"invalid": "format"}])
    assert "achievements" in str(exc_info.value)

def test_user_model_voice_samples():
    """Test voice samples validation in UserModel."""
    # Test valid voice samples
    voice_samples = [
        {"timestamp": "2024-02-20T10:00:00", "duration": 2.5},
        {"timestamp": "2024-02-20T10:01:00", "duration": 3.0}
    ]
    user = UserModel(name="Test", voice_samples=voice_samples)
    assert len(user.voice_samples) == 2
    
    # Test invalid voice sample format
    with pytest.raises(ValidationError) as exc_info:
        UserModel(name="Test", voice_samples=[{"invalid": "format"}])
    assert "voice_samples" in str(exc_info.value)