# app/routes/admin.py
from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel
from typing import List, Optional
from app.services.db_services import (
    verify_session_token,
    get_all_service_requests,
    get_staff_members,
    assign_request_to_staff,
    update_request_status,
    get_staff_assignments,
    create_admin_session
)

router = APIRouter()

class AdminLoginRequest(BaseModel):
    username: str
    password: str

class AdminLoginResponse(BaseModel):
    session_token: str
    user_type: str
    username: str
    full_name: str
    role: str

class AssignRequestBody(BaseModel):
    staff_id: str
    notes: str = None

class UpdateStatusBody(BaseModel):
    status: str
    notes: str = None

class ServiceRequestResponse(BaseModel):
    id: str
    room_number: str
    request_type: str
    description: str
    priority: str
    status: str
    created_at: str
    assigned_staff_id: str = None
    assigned_by: str = None
    assigned_at: str = None
    notes: str = None

class StaffMemberResponse(BaseModel):
    id: str
    staff_id: str
    full_name: str
    department: str
    role: str
    is_available: bool

def verify_admin_session(authorization: str = Header(None)):
    """Verify admin session token"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    session_token = authorization.replace("Bearer ", "")
    session_info = verify_session_token(session_token)
    
    if not session_info or not session_info.get("valid"):
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    
    if session_info.get("user_type") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return session_info

@router.post("/admin/login")
async def admin_login(request: AdminLoginRequest):
    """Admin login endpoint"""
    try:
        result = create_admin_session(request.username, request.password)
        
        if not result["success"]:
            raise HTTPException(status_code=401, detail=result.get("message", "Invalid credentials"))
        
        return AdminLoginResponse(
            session_token=result["session_token"],
            user_type=result["user_type"],
            username=result["username"],
            full_name=result["full_name"],
            role=result["role"]
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

@router.get("/admin/requests")
async def get_service_requests(
    status: Optional[str] = None,
    session_info: dict = Depends(verify_admin_session)
):
    """Get all service requests with optional status filter"""
    try:
        requests = get_all_service_requests(status_filter=status)
        return {"requests": requests}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch requests: {str(e)}")

@router.get("/admin/staff")
async def get_staff(session_info: dict = Depends(verify_admin_session)):
    """Get all staff members"""
    try:
        staff = get_staff_members()
        return {"staff": staff}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch staff: {str(e)}")

@router.post("/admin/requests/{request_id}/assign")
async def assign_request(
    request_id: str,
    assignment: AssignRequestBody,
    session_info: dict = Depends(verify_admin_session)
):
    """Assign a service request to a staff member"""
    try:
        admin_user_id = session_info.get("admin_user_id", "demo_admin")
        
        success = assign_request_to_staff(
            request_id=request_id,
            staff_id=assignment.staff_id,
            admin_user_id=admin_user_id,
            notes=assignment.notes
        )
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to assign request")
        
        return {"message": "Request assigned successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to assign request: {str(e)}")

@router.put("/admin/requests/{request_id}/status")
async def update_status(
    request_id: str,
    status_update: UpdateStatusBody,
    session_info: dict = Depends(verify_admin_session)
):
    """Update the status of a service request"""
    try:
        success = update_request_status(
            request_id=request_id,
            status=status_update.status,
            notes=status_update.notes
        )
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to update status")
        
        return {"message": "Status updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update status: {str(e)}")

@router.get("/admin/assignments")
async def get_assignments(
    staff_id: Optional[str] = None,
    session_info: dict = Depends(verify_admin_session)
):
    """Get current staff assignments"""
    try:
        assignments = get_staff_assignments(staff_id=staff_id)
        return {"assignments": assignments}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch assignments: {str(e)}")

@router.get("/admin/dashboard")
async def get_dashboard_stats(session_info: dict = Depends(verify_admin_session)):
    """Get dashboard statistics"""
    try:
        all_requests = get_all_service_requests()
        staff = get_staff_members()
        
        # Calculate statistics
        stats = {
            "total_requests": len(all_requests),
            "pending_requests": len([r for r in all_requests if r["status"] == "pending"]),
            "in_progress_requests": len([r for r in all_requests if r["status"] in ["assigned", "in_progress"]]),
            "completed_requests": len([r for r in all_requests if r["status"] == "completed"]),
            "total_staff": len(staff),
            "available_staff": len([s for s in staff if s.get("is_available", True)]),
            "urgent_requests": len([r for r in all_requests if r["priority"] == "urgent"]),
            "emergency_requests": len([r for r in all_requests if r["priority"] == "emergency"])
        }
        
        return {"stats": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch dashboard stats: {str(e)}")