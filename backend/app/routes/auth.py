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
    user_type: str
    guest_name: str
    room_number: str

class AuthRequest(BaseModel):
    session_token: str

@router.post("/auth/login")
async def login(request: LoginRequest):
    """Handle guest login with validation"""
    
    if not request.room_number or not request.guest_name:
        raise HTTPException(status_code=400, detail="Room number and guest name are required")
    
    try:
        # Validate guest credentials and create session
        session_token = create_guest_session(
            request.room_number,
            request.guest_name
        )
        
        return LoginResponse(
            session_token=session_token,
            user_type="guest",
            guest_name=request.guest_name,
            room_number=request.room_number
        )
    except Exception as e:
        # Handle validation failures
        error_message = str(e)
        if "Invalid guest credentials" in error_message:
            raise HTTPException(status_code=401, detail="Invalid room number or guest name")
        else:
            raise HTTPException(status_code=500, detail="Login failed")

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