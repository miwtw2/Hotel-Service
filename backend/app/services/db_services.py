import os
from supabase import create_client, Client
from datetime import datetime, timedelta
import secrets
import hashlib
from dotenv import load_dotenv

load_dotenv()

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if SUPABASE_URL and SUPABASE_KEY:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    supabase = None
    print("Warning: Supabase not configured. Database operations will be skipped.")

def create_guest_session(room_number: str, guest_name: str) -> str:
    """Create a new guest session and return session token"""
    if not supabase:
        return "demo_token_" + secrets.token_urlsafe(16)
    
    try:
        # Generate a secure session token
        session_token = secrets.token_urlsafe(32)
        
        # Create session record
        result = supabase.table("guest_sessions").insert({
            "room_number": room_number,
            "guest_name": guest_name,
            "session_token": session_token,
            "expires_at": (datetime.now() + timedelta(hours=24)).isoformat()
        }).execute()
        
        return session_token
    except Exception as e:
        print(f"Error creating session: {e}")
        return "demo_token_" + secrets.token_urlsafe(16)

def create_admin_session(username: str, password: str) -> dict:
    """Create an admin session and return session info"""
    
    # Force demo mode until database is properly set up
    # if not supabase:
    if True:  # Force demo mode
        # Demo mode for admin
        if username == "admin" and password == "admin123":
            return {
                "success": True,
                "session_token": "demo_admin_token_" + secrets.token_urlsafe(16),
                "user_type": "admin",
                "username": username,
                "full_name": "Demo Administrator",
                "role": "admin"
            }
        return {"success": False, "message": "Invalid credentials"}
    
    try:
        # Hash the password
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        # Verify admin credentials
        result = supabase.table("admin_users").select("*").eq(
            "username", username
        ).eq("password_hash", password_hash).eq("is_active", True).execute()
        
        if not result.data:
            return {"success": False, "message": "Invalid credentials"}
        
        admin_user = result.data[0]
        
        # Generate session token
        session_token = secrets.token_urlsafe(32)
        
        # Create admin session record
        supabase.table("admin_sessions").insert({
            "admin_user_id": admin_user["id"],
            "session_token": session_token,
            "expires_at": (datetime.now() + timedelta(hours=8)).isoformat()
        }).execute()
        
        return {
            "success": True,
            "session_token": session_token,
            "user_type": "admin",
            "username": admin_user["username"],
            "full_name": admin_user["full_name"],
            "role": admin_user["role"]
        }
        
    except Exception as e:
        print(f"Error creating admin session: {e}")
        return {"success": False, "message": "Authentication failed"}

def verify_session_token(session_token: str) -> dict:
    """Verify session token and return session info"""
    # Force demo mode until database is properly set up
    # if not supabase:
    if True:  # Force demo mode to match create_admin_session
        if session_token.startswith("demo_admin_token_"):
            return {
                "valid": True,
                "user_type": "admin",
                "username": "admin",
                "full_name": "Demo Administrator",
                "role": "admin"
            }
        else:
            return {
                "valid": True,
                "user_type": "guest",
                "room_number": "101",
                "guest_name": "Demo Guest"
            }
    
    try:
        # Check if it's an admin session
        admin_result = supabase.table("admin_sessions").select(
            "*, admin_users(*)"
        ).eq("session_token", session_token).eq("is_active", True).gte(
            "expires_at", datetime.now().isoformat()
        ).execute()
        
        if admin_result.data:
            session = admin_result.data[0]
            admin_user = session["admin_users"]
            return {
                "valid": True,
                "user_type": "admin",
                "username": admin_user["username"],
                "full_name": admin_user["full_name"],
                "role": admin_user["role"],
                "admin_user_id": admin_user["id"]
            }
        
        # Check if it's a guest session
        guest_result = supabase.table("guest_sessions").select("*").eq(
            "session_token", session_token
        ).eq("is_active", True).gte(
            "expires_at", datetime.now().isoformat()
        ).execute()
        
        if guest_result.data:
            session = guest_result.data[0]
            return {
                "valid": True,
                "user_type": "guest",
                "room_number": session["room_number"],
                "guest_name": session["guest_name"]
            }
        else:
            return {"valid": False}
            
    except Exception as e:
        print(f"Error verifying session: {e}")
        return {"valid": False}

def log_message(room_number: str, message_text: str, sender_type: str, session_token: str = None):
    """Log a chat message to the database"""
    if not supabase:
        print(f"Would log: [{sender_type}] {room_number}: {message_text}")
        return
    
    try:
        supabase.table("chat_messages").insert({
            "room_number": room_number,
            "message_text": message_text,
            "sender_type": sender_type,
            "session_token": session_token
        }).execute()
    except Exception as e:
        print(f"Error logging message: {e}")

def create_service_request(room_number: str, request_type: str, description: str, 
                         priority: str = "normal", session_token: str = None):
    """Create a new service request"""
    if not supabase:
        print(f"Would create service request: {request_type} for room {room_number}")
        return
    
    try:
        result = supabase.table("service_requests").insert({
            "room_number": room_number,
            "request_type": request_type,
            "description": description,
            "priority": priority,
            "session_token": session_token
        }).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        print(f"Error creating service request: {e}")
        return None

def get_chat_history(room_number: str, limit: int = 50) -> list:
    """Get chat history for a room"""
    if not supabase:
        return []
    
    try:
        result = supabase.table("chat_messages").select("*").eq(
            "room_number", room_number
        ).order("created_at", desc=False).limit(limit).execute()
        
        return result.data or []
    except Exception as e:
        print(f"Error getting chat history: {e}")
        return []

def cleanup_expired_sessions():
    """Clean up expired sessions"""
    if not supabase:
        return
    
    try:
        supabase.rpc("cleanup_expired_sessions").execute()
    except Exception as e:
        print(f"Error cleaning up sessions: {e}")

# Admin and Staff Management Functions

def get_all_service_requests(status_filter: str = None) -> list:
    """Get all service requests with optional status filter"""
    if not supabase:
        return [
            {
                "id": "demo_1",
                "room_number": "101",
                "request_type": "housekeeping",
                "description": "Need extra towels",
                "priority": "normal",
                "status": "pending",
                "created_at": "2025-09-17T10:00:00Z",
                "assigned_staff_id": None,
                "assigned_by": None
            }
        ]
    
    try:
        query = supabase.table("service_requests").select(
            "*, staff_members(staff_id, full_name, department), admin_users(username, full_name)"
        )
        
        if status_filter:
            query = query.eq("status", status_filter)
        
        result = query.order("created_at", desc=True).execute()
        return result.data or []
    except Exception as e:
        print(f"Error getting service requests: {e}")
        return []

def get_staff_members() -> list:
    """Get all staff members"""
    if not supabase:
        return [
            {
                "id": "demo_staff_1",
                "staff_id": "HK001",
                "full_name": "Demo Housekeeper",
                "department": "Housekeeping",
                "role": "Housekeeper",
                "is_available": True
            }
        ]
    
    try:
        result = supabase.table("staff_members").select("*").order("department", desc=False).execute()
        return result.data or []
    except Exception as e:
        print(f"Error getting staff members: {e}")
        return []

def assign_request_to_staff(request_id: str, staff_id: str, admin_user_id: str, notes: str = None) -> bool:
    """Assign a service request to a staff member"""
    if not supabase:
        print(f"Demo: Would assign request {request_id} to staff {staff_id}")
        return True
    
    try:
        update_data = {
            "assigned_staff_id": staff_id,
            "assigned_by": admin_user_id,
            "assigned_at": datetime.now().isoformat(),
            "status": "assigned"
        }
        
        if notes:
            update_data["notes"] = notes
        
        result = supabase.table("service_requests").update(update_data).eq("id", request_id).execute()
        return len(result.data) > 0
    except Exception as e:
        print(f"Error assigning request: {e}")
        return False

def update_request_status(request_id: str, status: str, notes: str = None) -> bool:
    """Update the status of a service request"""
    if not supabase:
        print(f"Demo: Would update request {request_id} to status {status}")
        return True
    
    try:
        update_data = {"status": status}
        if notes:
            update_data["notes"] = notes
        
        result = supabase.table("service_requests").update(update_data).eq("id", request_id).execute()
        return len(result.data) > 0
    except Exception as e:
        print(f"Error updating request status: {e}")
        return False

def get_staff_assignments(staff_id: str = None) -> list:
    """Get current assignments for staff members"""
    if not supabase:
        return []
    
    try:
        query = supabase.table("service_requests").select(
            "*, staff_members(staff_id, full_name, department)"
        ).in_("status", ["assigned", "in_progress"])
        
        if staff_id:
            query = query.eq("assigned_staff_id", staff_id)
        
        result = query.order("assigned_at", desc=True).execute()
        return result.data or []
    except Exception as e:
        print(f"Error getting staff assignments: {e}")
        return []

def get_requests_by_room(room_number: str) -> list:
    """Get all service requests for a specific room"""
    if not supabase:
        return []
    
    try:
        result = supabase.table("service_requests").select(
            "*, staff_members(staff_id, full_name, department)"
        ).eq("room_number", room_number).order("created_at", desc=True).execute()
        
        return result.data or []
    except Exception as e:
        print(f"Error getting requests for room: {e}")
        return []
