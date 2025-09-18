# app/routes/guest.py
from fastapi import APIRouter, HTTPException, Header, Depends
from typing import List
from app.services.db_services import verify_session_token, get_requests_by_room

router = APIRouter()

def verify_guest_session(authorization: str = Header(None)):
    """Verify guest session token"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    session_token = authorization.replace("Bearer ", "")
    session_info = verify_session_token(session_token)
    
    if not session_info or not session_info.get("valid"):
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    
    if session_info.get("user_type") != "guest":
        raise HTTPException(status_code=403, detail="Guest access required")
    
    return session_info

@router.get("/guest/my-requests")
async def get_my_requests(session_info: dict = Depends(verify_guest_session)):
    """Get all service requests for the logged-in guest's room"""
    try:
        room_number = session_info.get("room_number")
        if not room_number:
            raise HTTPException(status_code=400, detail="Room number not found in session")
        
        requests = get_requests_by_room(room_number)
        
        # Format the response to include status information
        formatted_requests = []
        for req in requests:
            formatted_req = {
                "id": req["id"],
                "request_type": req["request_type"],
                "description": req["description"],
                "priority": req["priority"],
                "status": req["status"],
                "created_at": req["created_at"],
                "notes": req.get("notes"),
                "assigned_staff": None
            }
            
            # Add staff information if assigned
            if req.get("staff_members"):
                staff = req["staff_members"]
                formatted_req["assigned_staff"] = {
                    "name": staff["full_name"],
                    "department": staff["department"]
                }
            
            formatted_requests.append(formatted_req)
        
        return {"requests": formatted_requests}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch requests: {str(e)}")

@router.get("/guest/requests/status")
async def get_request_status_summary(session_info: dict = Depends(verify_guest_session)):
    """Get a summary of request statuses for the guest"""
    try:
        room_number = session_info.get("room_number")
        if not room_number:
            raise HTTPException(status_code=400, detail="Room number not found in session")
        
        requests = get_requests_by_room(room_number)
        
        # Calculate status summary
        status_summary = {
            "total_requests": len(requests),
            "pending": len([r for r in requests if r["status"] == "pending"]),
            "acknowledged": len([r for r in requests if r["status"] == "acknowledged"]),
            "assigned": len([r for r in requests if r["status"] == "assigned"]),
            "in_progress": len([r for r in requests if r["status"] == "in_progress"]),
            "completed": len([r for r in requests if r["status"] == "completed"]),
            "latest_request": None
        }
        
        # Get the latest request
        if requests:
            latest = max(requests, key=lambda x: x["created_at"])
            status_summary["latest_request"] = {
                "type": latest["request_type"],
                "status": latest["status"],
                "created_at": latest["created_at"]
            }
        
        return {"status_summary": status_summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch status summary: {str(e)}")