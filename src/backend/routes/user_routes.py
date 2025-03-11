from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from pydantic import BaseModel

router = APIRouter()

# Mock database for demonstration
users_db: Dict[str, Dict[str, Any]] = {}

class UserCreate(BaseModel):
    name: str
    phone_number: str | None = None

class PhoneVerification(BaseModel):
    phone_number: str
    code: str

@router.post("/users/")
async def create_user(user: UserCreate):
    user_id = str(len(users_db) + 1)
    users_db[user_id] = user.dict()
    return {"id": user_id, **users_db[user_id]}

@router.post("/users/verify-phone")
async def verify_phone(verification: PhoneVerification):
    # Simulated phone verification (in production, use a real SMS service)
    # For demo purposes, any 6-digit code is accepted
    if len(verification.code) != 6 or not verification.code.isdigit():
        raise HTTPException(status_code=400, detail="Invalid verification code")
    
    # Check if user exists with this phone number
    user_id = None
    for uid, user in users_db.items():
        if user.get("phone_number") == verification.phone_number:
            user_id = uid
            break
    
    if not user_id:
        # Create new user if phone number not found
        user_id = str(len(users_db) + 1)
        users_db[user_id] = {
            "name": f"User {user_id}",
            "phone_number": verification.phone_number
        }
    
    return {"id": user_id, **users_db[user_id]}

@router.get("/users/{user_id}")
async def get_user(user_id: str):
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": user_id, **users_db[user_id]} 