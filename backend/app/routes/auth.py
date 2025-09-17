# app/routes/auth.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.db_services import create_guest_session, verify_session_token
import secrets

router = APIRouter()

class LoginRequest(BaseModel):
    room_number: str
    guest_name: str

class LoginResponse(BaseModel):
    session_token: str
    guest_name: str
    room_number: str

class AuthRequest(BaseModel):
    session_token: str

@router.post("/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """Simple login with room number and guest name"""
    if not request.room_number or not request.guest_name:
        raise HTTPException(status_code=400, detail="Room number and guest name are required")
    
    # Create session in database (this generates and returns the session token)
    session_token = create_guest_session(
        request.room_number,
        request.guest_name
    )
    
    if not session_token:
        raise HTTPException(status_code=500, detail="Failed to create session")
    
    return LoginResponse(
        session_token=session_token,
        guest_name=request.guest_name,
        room_number=request.room_number
    )

@router.post("/auth/verify")
async def verify_session(request: AuthRequest):
    """Verify if session token is valid"""
    guest_info = verify_session_token(request.session_token)
    if not guest_info or not guest_info.get("valid"):
        raise HTTPException(status_code=401, detail="Invalid session")
    
    return {
        "valid": True,
        "guest_name": guest_info["guest_name"],
        "room_number": guest_info["room_number"]
    }