from fastapi import APIRouter, HTTPException, Depends, status
from typing import Dict, Any, List
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime

# Import the database dependency
from config.database import get_database

router = APIRouter()

# MongoDB-based models
class UserCreate(BaseModel):
    name: str
    phone: str | None = None

class PhoneVerification(BaseModel):
    phone: str
    code: str

@router.post("/users/")
async def create_user(
    user: UserCreate,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Create a new user in MongoDB"""
    users_collection = db["users"]
    
    # Convert model to dictionary for database
    user_data = user.model_dump()
    user_data["created_at"] = datetime.now()
    user_data["updated_at"] = datetime.now()
    
    # Insert into database
    result = await users_collection.insert_one(user_data)
    
    # Get the created user
    created_user = await users_collection.find_one({"_id": result.inserted_id})
    created_user["id"] = str(created_user.pop("_id"))
    
    return created_user

@router.post("/users/verify-phone")
async def verify_phone(
    verification: PhoneVerification,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Verify phone number and create/retrieve user"""
    # Simulated phone verification (in production, use a real SMS service)
    # For demo purposes, any 6-digit code is accepted
    if len(verification.code) != 6 or not verification.code.isdigit():
        raise HTTPException(status_code=400, detail="Invalid verification code")
    
    users_collection = db["users"]
    
    # Check if user exists with this phone number
    existing_user = await users_collection.find_one({"phone": verification.phone})
    
    if existing_user:
        # User exists, return the user
        existing_user["id"] = str(existing_user.pop("_id"))
        return existing_user
    else:
        # Create new user if phone number not found
        new_user = {
            "name": f"User",  # Will be updated later
            "phone": verification.phone,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        
        result = await users_collection.insert_one(new_user)
        created_user = await users_collection.find_one({"_id": result.inserted_id})
        created_user["id"] = str(created_user.pop("_id"))
        
        return created_user

@router.get("/users/{user_id}")
async def get_user(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get user by ID from MongoDB"""
    users_collection = db["users"]
    
    try:
        object_id = ObjectId(user_id)
        user = await users_collection.find_one({"_id": object_id})
        
        if not user:
            raise HTTPException(status_code=404, detail=f"User not found")
        
        user["id"] = str(user.pop("_id"))
        return user
    except Exception as e:
        if "ObjectId" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid user ID: {user_id}"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving user: {str(e)}"
        )

@router.get("/users/")
async def list_users(
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """List all users from MongoDB"""
    users_collection = db["users"]
    
    users = await users_collection.find().to_list(1000)
    for user in users:
        user["id"] = str(user.pop("_id"))
    
    return users 