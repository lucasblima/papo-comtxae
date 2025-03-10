import pytest
from fastapi.testclient import TestClient
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure

from main import app

@pytest.fixture
def test_client():
    return TestClient(app)

@pytest.fixture
async def mongo_client():
    # Use in-memory MongoDB for testing
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    yield client
    client.close()

@pytest.fixture(autouse=True)
async def setup_test_db(mongo_client):
    """Set up and tear down test database."""
    # Setup
    test_db = mongo_client.test_database
    
    # Clear collections if they exist
    if "residents" in await test_db.list_collection_names():
        await test_db.residents.delete_many({})
    if "requests" in await test_db.list_collection_names():
        await test_db.requests.delete_many({})
    
    yield
    
    # Teardown - clean up after tests
    await test_db.residents.delete_many({})
    await test_db.requests.delete_many({}) 