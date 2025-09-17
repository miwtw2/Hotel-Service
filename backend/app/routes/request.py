# app/routes/requests.py
from fastapi import APIRouter
from pydantic import BaseModel
from app.services.db_service import handle_quick_request

router = APIRouter()

class RequestBody(BaseModel):
    request: str
    room: str

class RequestResponse(BaseModel):
    status: str

@router.post("/request", response_model=RequestResponse)
async def request_endpoint(body: RequestBody):
    # handle_quick_request logs the request and returns a staff confirmation or predefined answer
    reply = handle_quick_request(body.room, body.request)
    return RequestResponse(status=reply)
