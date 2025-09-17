from fastapi import APIRouter, Query
from app.services.db_services import get_messages

router = APIRouter()

@router.get("/history")
async def chat_history(room_number: str = Query(...)):
    messages = get_messages(room_number)
    return {"messages": messages}
