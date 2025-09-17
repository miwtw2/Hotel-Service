# app/routes/chat.py
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from app.services.ai_services import get_ai_response
from app.services.db_services import verify_session_token

router = APIRouter()

class ChatRequest(BaseModel):
    text: str

class ChatResponse(BaseModel):
    reply: str

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, authorization: str = Header(None)):
    # Verify session token
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    session_token = authorization.replace("Bearer ", "")
    guest_info = verify_session_token(session_token)
    
    if not guest_info or not guest_info.get("valid"):
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    
    # Use the verified guest info for the AI response
    reply = get_ai_response(request.text, guest_info["room_number"])
    return ChatResponse(reply=reply)
