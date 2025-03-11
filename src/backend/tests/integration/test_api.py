import pytest
from fastapi.testclient import TestClient
from bson import ObjectId

def test_health_endpoint(test_client):
    """Test health check endpoint."""
    response = test_client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_get_residents(test_client):
    """Test retrieving residents list."""
    response = test_client.get("/residents/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_resident(test_client):
    """Test creating a new resident."""
    new_resident = {
        "name": "João Silva",
        "email": "joao@example.com",
        "phone": "11987654321",
        "unit_number": "101A",
        "is_active": True
    }

    response = test_client.post("/residents/", json=new_resident)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == new_resident["name"]
    assert data["email"] == new_resident["email"]
    assert "id" in data

def test_get_resident_by_id(test_client):
    """Test retrieving a specific resident by ID."""
    # First create a resident
    new_resident = {
        "name": "Carlos Santos",
        "email": "carlos@example.com",
        "phone": "11987654323",
        "unit_number": "304C",
        "is_active": True
    }

    create_response = test_client.post("/residents/", json=new_resident)
    assert create_response.status_code == 201
    created_resident = create_response.json()
    
    # Verificar se o campo id está presente
    assert "id" in created_resident, f"Campo 'id' não encontrado na resposta: {created_resident}"
    resident_id = created_resident["id"]

    # Then retrieve it
    get_response = test_client.get(f"/residents/{resident_id}")
    assert get_response.status_code == 200
    retrieved_resident = get_response.json()
    assert retrieved_resident["name"] == new_resident["name"]
    assert retrieved_resident["email"] == new_resident["email"]
    assert retrieved_resident["id"] == resident_id

def test_create_resident_validation(test_client):
    """Test validation when creating a resident."""
    invalid_resident = {
        "name": "T",  # too short
        "email": "not-an-email",
        "phone": "123"  # invalid phone
    }

    response = test_client.post("/residents/", json=invalid_resident)
    assert response.status_code == 422
    errors = response.json()["detail"]
    assert any("name" in error["loc"] for error in errors)
    assert any("email" in error["loc"] for error in errors)
    assert any("phone" in error["loc"] for error in errors) 