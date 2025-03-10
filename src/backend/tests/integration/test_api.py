import pytest
from fastapi.testclient import TestClient

def test_health_endpoint(test_client):
    """Test the API health endpoint."""
    response = test_client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["message"] == "Papo Social API está funcionando!"

def test_get_residents(test_client):
    """Test retrieving residents list."""
    response = test_client.get("/residents")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    
def test_create_resident(test_client):
    """Test creating a new resident."""
    new_resident = {
        "name": "Maria Oliveira",
        "email": "maria@example.com",
        "phone": "11987654322",
        "address": "Rua XYZ, 456",
        "is_active": True
    }
    
    response = test_client.post("/residents", json=new_resident)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == new_resident["name"]
    assert "id" in data

def test_get_resident_by_id(test_client):
    """Test retrieving a specific resident by ID."""
    # First create a resident
    new_resident = {
        "name": "Carlos Santos",
        "email": "carlos@example.com",
        "phone": "11987654323",
        "is_active": True
    }
    
    create_response = test_client.post("/residents", json=new_resident)
    assert create_response.status_code == 201
    created_data = create_response.json()
    resident_id = created_data["id"]
    
    # Now try to retrieve the created resident
    get_response = test_client.get(f"/residents/{resident_id}")
    assert get_response.status_code == 200
    get_data = get_response.json()
    assert get_data["name"] == new_resident["name"]
    assert get_data["id"] == resident_id 