# app/routes/chat.py
from fastapi import APIRouter
from pydantic import BaseModel
from app.services.ai_service import get_ai_response

router = APIRouter()

class ChatRequest(BaseModel):
    text: str
    room_number: str

class ChatResponse(BaseModel):
    reply: str

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    reply = get_ai_response(request.text, request.room_number)
    return ChatResponse(reply=reply)
