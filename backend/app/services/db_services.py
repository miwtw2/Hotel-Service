import os
from supabase import create_client, Client
from datetime import datetime, timedelta
import secrets
import hashlib
import uuid
from dotenv import load_dotenv

# Load .env from the backend directory
backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
env_path = os.path.join(backend_dir, '.env')
load_dotenv(env_path)

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if SUPABASE_URL and SUPABASE_KEY:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    supabase = None
    print("Warning: Supabase not configured. Database operations will be skipped.")

# Database operations now require Supabase connection

def create_guest_session(room_number: str, guest_name: str) -> str:
    """Create a new guest session and return session token after validation"""
    if not supabase:
        raise Exception("Database connection required - Supabase not configured")
    
    try:
        # Validate that the guest exists in the guest_sessions table
        validation_result = supabase.table("guest_sessions").select("*").eq(
            "room_number", room_number
        ).ilike(
            "guest_name", guest_name
        ).is_("checkout_time", "null").execute()  # Only active guests (not checked out)
        
        if not validation_result.data:
            # Try case-insensitive match
            all_room_sessions = supabase.table("guest_sessions").select("*").eq(
                "room_number", room_number
            ).execute()
            
            matching_guests = [
                g for g in (all_room_sessions.data or []) 
                if g.get('guest_name', '').lower() == guest_name.lower() and g.get('checkout_time') is None
            ]
            
            if not matching_guests:
                raise Exception(f"Invalid guest credentials: No active guest found for room {room_number} with name {guest_name}")
        
        # Guest validation passed - generate a new session token
        session_token = secrets.token_urlsafe(32)
        
        # Create a new session record to avoid foreign key constraint issues
        new_session_result = supabase.table("guest_sessions").insert({
            "room_number": room_number,
            "guest_name": guest_name,
            "session_token": session_token,
            "expires_at": (datetime.now() + timedelta(hours=24)).isoformat(),
            "checkout_time": None
        }).execute()
        
        if not new_session_result.data:
            raise Exception("Failed to create new guest session")
        
        return session_token
    except Exception as e:
        if "violates foreign key constraint" in str(e):
            raise Exception("Session creation failed due to existing chat history")
        raise Exception(f"Login failed: {str(e)}")

def create_admin_session(username: str, password: str) -> dict:
    """Create an admin session and return session info"""
    
    if not supabase:
        raise Exception("Database connection required")
    
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
        return {"success": False, "message": "Login failed"}

def verify_session_token(session_token: str) -> dict:
    """Verify session token and return session info"""
    if not supabase:
        raise Exception("Database connection required")
    
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
        # Create the main service request
        result = supabase.table("service_requests").insert({
            "room_number": room_number,
            "request_type": request_type,
            "description": description,
            "priority": priority,
            "session_token": session_token
        }).execute()
        
        if result.data:
            service_request = result.data[0]
            
            # Get customer name from session token
            customer_name = "Unknown Guest"
            if session_token:
                guest_result = supabase.table("guest_sessions").select("guest_name").eq(
                    "session_token", session_token
                ).execute()
                if guest_result.data:
                    customer_name = guest_result.data[0].get('guest_name', 'Unknown Guest')
            
            # Create persistent history entry (optional - don't fail if this fails)
            try:
                create_persistent_history_entry(
                    original_request_id=service_request['id'],
                    customer_name=customer_name,
                    room_number=room_number,
                    request_type=request_type,
                    description=description,
                    priority=priority,
                    status="pending",
                    session_token=session_token
                )
            except Exception as e:
                print(f"Warning: Could not create persistent history entry: {e}")
            
            return service_request
        return None
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
        raise Exception("Database connection required")
    
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
    except Exception as e:
        print(f"Error getting service requests: {e}")
        return []

def get_staff_members() -> list:
    """Get all staff members"""
    if not supabase:
        raise Exception("Database connection required")
    
    try:
        result = supabase.table("staff_members").select("*").order("department", desc=False).execute()
        return result.data or []
    except Exception as e:
        print(f"Error getting staff members: {e}")
        return []

def assign_request_to_staff(request_id: str, staff_id: str, admin_user_id: str, notes: str = None) -> bool:
    """Assign a service request to a staff member"""
    if not supabase:
        raise Exception("Database connection required")
    
    try:
        # Check if staff_id is a UUID or staff_id code, and get the actual UUID
        actual_staff_uuid = staff_id
        
        # If staff_id looks like a code (not a UUID), look it up
        if not staff_id.count('-') == 4:  # Simple check for UUID format
            staff_result = supabase.table("staff_members").select("id").eq("staff_id", staff_id).execute()
            if not staff_result.data:
                print(f"Error: Staff member with staff_id {staff_id} not found")
                return False
            actual_staff_uuid = staff_result.data[0]["id"]
        
        update_data = {
            "assigned_staff_id": actual_staff_uuid,
            "assigned_by": admin_user_id,
            "assigned_at": datetime.now().isoformat(),
            "status": "assigned"
        }
        
        if notes:
            update_data["notes"] = notes
        
        result = supabase.table("service_requests").update(update_data).eq("id", request_id).execute()
        
        # Create request history entry
        if result.data:
            create_request_history_entry(
                request_id=request_id,
                action="assigned",
                details=f"Assigned to staff member {staff_id}",
                user_type="admin",
                user_id=admin_user_id
            )
        
        return len(result.data) > 0
    except Exception as e:
        print(f"Error assigning request: {e}")
        return False

def update_request_status(request_id: str, status: str, notes: str = None) -> bool:
    """Update the status of a service request"""
    if not supabase:
        raise Exception("Database connection required")
    
    try:
        # Get old status first
        old_request = supabase.table("service_requests").select("status").eq("id", request_id).execute()
        old_status = old_request.data[0]["status"] if old_request.data else "unknown"
        
        update_data = {"status": status}
        if notes:
            update_data["notes"] = notes
        
        result = supabase.table("service_requests").update(update_data).eq("id", request_id).execute()
        
        # Create request history entry
        if result.data:
            create_request_history_entry(
                request_id=request_id,
                action="status_changed",
                details=f"Status changed from {old_status} to {status}",
                user_type="admin",
                user_id="admin"
            )
        
        return len(result.data) > 0
    except Exception as e:
        print(f"Error updating request status: {e}")
        return False

def get_staff_assignments(staff_id: str = None) -> list:
    """Get all assignments for staff members (transformed to assignment format)"""
    if not supabase:
        raise Exception("Database connection required")
    
    try:
        # Get all assigned requests (not just active ones for proper workload calculation)
        query = supabase.table("service_requests").select(
            "*, staff_members(staff_id, full_name, department, role)"
        ).not_.is_("assigned_staff_id", "null")
        
        if staff_id:
            # Join with staff_members to filter by staff_id
            query = query.eq("staff_members.staff_id", staff_id)
        
        result = query.order("assigned_at", desc=True).execute()
        
        # Transform to assignment format
        assignments = []
        for request in result.data or []:
            if request.get("staff_members"):
                assignment = {
                    "id": f"assign_{request['id']}",
                    "request_id": request["id"],
                    "staff_id": request["staff_members"]["staff_id"],
                    "assigned_at": request.get("assigned_at") or request["created_at"],
                    "notes": request.get("notes"),
                    "service_requests": {
                        "room_number": request["room_number"],
                        "request_type": request["request_type"],
                        "description": request["description"],
                        "priority": request["priority"],
                        "status": request["status"],
                        "created_at": request["created_at"]
                    },
                    "staff_members": {
                        "full_name": request["staff_members"]["full_name"],
                        "department": request["staff_members"]["department"],
                        "role": request["staff_members"]["role"]
                    }
                }
                assignments.append(assignment)
        
        return assignments
    except Exception as e:
        print(f"Error getting staff assignments: {e}")
        return []

def get_requests_by_room(room_number: str) -> list:
    """Get all service requests for a specific room"""
    if not supabase:
        raise Exception("Database connection required")
    
    try:
        result = supabase.table("service_requests").select(
            "*, staff_members(staff_id, full_name, department)"
        ).eq("room_number", room_number).order("created_at", desc=True).execute()
        
        return result.data or []
    except Exception as e:
        print(f"Error getting requests for room: {e}")
        return []

def get_active_requests_by_room(room_number: str) -> list:
    """Get active (cancellable) service requests for a specific room"""
    if not supabase:
        raise Exception("Database connection required")
    
    try:
        # Get requests that can be cancelled (pending, assigned - not completed, cancelled)
        cancellable_statuses = ['pending', 'assigned', 'in_progress']
        
        result = supabase.table("service_requests").select(
            "id, request_type, description, status, created_at, priority"
        ).eq("room_number", room_number).in_("status", cancellable_statuses).order("created_at", desc=True).execute()
        
        return result.data or []
    except Exception as e:
        print(f"Error getting active requests for room: {e}")
        return []

def cancel_service_request(request_id: str, reason: str = "Cancelled by guest") -> bool:
    """Cancel a service request"""
    if not supabase:
        raise Exception("Database connection required")
    
    try:
        # Update request status to cancelled
        result = supabase.table("service_requests").update({
            "status": "cancelled",
            "notes": reason
        }).eq("id", request_id).execute()
        
        if result.data:
            # Update persistent history
            update_persistent_history_status(request_id, "cancelled", reason)
            
            # Create history entry
            try:
                supabase.table("request_history").insert({
                    "request_id": request_id,
                    "action": "cancelled",
                    "details": reason,
                    "user_type": "guest",
                    "user_id": "guest_chat"
                }).execute()
            except Exception as he:
                print(f"Note: Could not log cancellation history: {he}")
            
            return True
        return False
    except Exception as e:
        print(f"Error cancelling request: {e}")
        return False

def delete_cancelled_request(request_id: str) -> bool:
    """Permanently delete a cancelled service request (admin only) - preserves chat history"""
    if not supabase:
        raise Exception("Database connection required")
    
    try:
        # First verify the request exists and is cancelled
        request_check = supabase.table("service_requests").select("status").eq("id", request_id).execute()
        
        if not request_check.data:
            print(f"Request {request_id} not found")
            return False
        
        if request_check.data[0]["status"] != "cancelled":
            print(f"Request {request_id} is not cancelled, cannot delete")
            return False
        
        # Delete related request history entries (but preserve chat messages)
        try:
            supabase.table("request_history").delete().eq("request_id", request_id).execute()
            print(f"Deleted request history for {request_id}")
        except Exception as he:
            print(f"Note: Could not delete request history: {he}")
        
        # Mark persistent history as deleted (preserves the data)
        mark_persistent_history_deleted(request_id)
        
        # Delete the request (chat history is preserved in chat_messages table)
        result = supabase.table("service_requests").delete().eq("id", request_id).execute()
        print(f"Deleted cancelled request {request_id}, chat history and persistent history preserved")
        
        return len(result.data) > 0
    except Exception as e:
        print(f"Error deleting cancelled request: {e}")
        return False

# Additional staff management functions

def add_staff_member(staff_data: dict) -> bool:
    """Add a new staff member"""
    if not supabase:
        raise Exception("Database connection required")
    
    try:
        result = supabase.table("staff_members").insert(staff_data).execute()
        return len(result.data) > 0
    except Exception as e:
        print(f"Error adding staff member: {e}")
        return False

def update_staff_availability(staff_id: str, is_available: bool) -> bool:
    """Toggle staff member availability"""
    if not supabase:
        raise Exception("Database connection required")
    
    try:
        # Check if staff_id is a UUID or staff_id code, and get the actual UUID
        actual_staff_uuid = staff_id
        
        # If staff_id looks like a code (not a UUID), look it up
        if not staff_id.count('-') == 4:  # Simple check for UUID format
            staff_result = supabase.table("staff_members").select("id").eq("staff_id", staff_id).execute()
            if not staff_result.data:
                print(f"Error: Staff member with staff_id {staff_id} not found")
                return False
            actual_staff_uuid = staff_result.data[0]["id"]
        
        result = supabase.table("staff_members").update({
            "is_available": is_available
        }).eq("id", actual_staff_uuid).execute()
        return len(result.data) > 0
    except Exception as e:
        print(f"Error updating staff availability: {e}")
        return False

def update_request_priority(request_id: str, priority: str) -> bool:
    """Update the priority of a service request"""
    if not supabase:
        raise Exception("Database connection required")
    
    try:
        # Get old priority first
        old_request = supabase.table("service_requests").select("priority").eq("id", request_id).execute()
        old_priority = old_request.data[0]["priority"] if old_request.data else "unknown"
        
        result = supabase.table("service_requests").update({
            "priority": priority
        }).eq("id", request_id).execute()
        
        # Create request history entry
        if result.data:
            create_request_history_entry(
                request_id=request_id,
                action="priority_changed",
                details=f"Priority changed from {old_priority} to {priority}",
                user_type="admin",
                user_id="admin"
            )
        
        return len(result.data) > 0
    except Exception as e:
        print(f"Error updating request priority: {e}")
        return False

def get_request_history(request_id: str) -> list:
    """Get the history of actions for a specific request"""
    if not supabase:
        raise Exception("Database connection required")
    
    try:
        result = supabase.table("request_history").select("*").eq(
            "request_id", request_id
        ).order("timestamp", desc=False).execute()
        
        return result.data or []
    except Exception as e:
        print(f"Note: Request history will be available when table is created: {e}")
        return []

def get_all_request_history() -> list:
    """Get the history of all requests"""
    if not supabase:
        raise Exception("Database connection required")
    
    try:
        result = supabase.table("request_history").select("*").order("timestamp", desc=True).execute()
        return result.data or []
    except Exception as e:
        print(f"Note: Request history will be available when table is created: {e}")
        return []

def delete_staff_member(staff_id: str) -> bool:
    """Delete a staff member"""
    if not supabase:
        raise Exception("Database connection required")
    
    try:
        # Check if staff_id is a UUID or staff_id code, and get the actual UUID
        actual_staff_uuid = staff_id
        
        # If staff_id looks like a code (not a UUID), look it up
        if not staff_id.count('-') == 4:  # Simple check for UUID format
            staff_result = supabase.table("staff_members").select("id").eq("staff_id", staff_id).execute()
            if not staff_result.data:
                print(f"Error: Staff member with staff_id {staff_id} not found")
                return False
            actual_staff_uuid = staff_result.data[0]["id"]
        
        result = supabase.table("staff_members").delete().eq("id", actual_staff_uuid).execute()
        return len(result.data) > 0
    except Exception as e:
        print(f"Error deleting staff member: {e}")
        return False

def update_staff_member(staff_id: str, staff_data: dict) -> bool:
    """Update a staff member's information"""
    if not supabase:
        raise Exception("Database connection required")
    
    try:
        # Check if staff_id is a UUID or staff_id code, and get the actual UUID
        actual_staff_uuid = staff_id
        
        # If staff_id looks like a code (not a UUID), look it up
        if not staff_id.count('-') == 4:  # Simple check for UUID format
            staff_result = supabase.table("staff_members").select("id").eq("staff_id", staff_id).execute()
            if not staff_result.data:
                print(f"Error: Staff member with staff_id {staff_id} not found")
                return False
            actual_staff_uuid = staff_result.data[0]["id"]
        
        result = supabase.table("staff_members").update(staff_data).eq("id", actual_staff_uuid).execute()
        return len(result.data) > 0
    except Exception as e:
        print(f"Error updating staff member: {e}")
        return False

def create_request_history_entry(request_id: str, action: str, details: str, user_type: str, user_id: str) -> bool:
    """Create a request history entry"""
    if not supabase:
        return True
    
    try:
        supabase.table("request_history").insert({
            "request_id": request_id,
            "action": action,
            "details": details,
            "user_type": user_type,
            "user_id": user_id
        }).execute()
        return True
    except Exception as e:
        print(f"Note: Request history will be tracked when table is created: {e}")
        return True

def get_customer_request_history() -> list:
    """Get customer request history with guest details"""
    if not supabase:
        raise Exception("Database connection required")
    
    try:
        # Use Supabase query builder to join service_requests with guest_sessions
        requests_result = supabase.table("service_requests").select(
            "*, guest_sessions!inner(guest_name, checkout_time)"
        ).order("created_at", desc=True).execute()
        
        # Transform the data to match our expected format
        customer_history = []
        for request in requests_result.data or []:
            guest_session = request.get('guest_sessions', {})
            customer_history.append({
                "customer_name": guest_session.get('guest_name') or f"Guest {request['room_number']}",
                "room_number": request['room_number'],
                "checkout_time": guest_session.get('checkout_time'),
                "request_date": request['created_at'],
                "request_type": request['request_type'],
                "description": request['description'],
                "status": request['status'],
                "priority": request['priority'],
                "request_id": request['id']
            })
        
        return customer_history
    except Exception as e:
        print(f"Error fetching customer request history: {e}")
        return []
        # Fallback to basic request data and try to match with guest sessions
        try:
            # Get all requests
            requests_result = supabase.table("service_requests").select("*").order("created_at", desc=True).execute()
            # Get all guest sessions
            sessions_result = supabase.table("guest_sessions").select("*").execute()
            
            # Create a lookup dictionary for guest sessions by room number
            sessions_by_room = {}
            for session in sessions_result.data or []:
                room = session['room_number']
                # Keep the most recent session for each room
                if room not in sessions_by_room or session['created_at'] > sessions_by_room[room]['created_at']:
                    sessions_by_room[room] = session
            
            # Combine requests with guest session data
            customer_history = []
            for request in requests_result.data or []:
                room = request['room_number']
                guest_session = sessions_by_room.get(room, {})
                
                customer_history.append({
                    "customer_name": guest_session.get('guest_name') or f"Guest {room}",
                    "room_number": room,
                    "checkout_time": guest_session.get('checkout_time'),
                    "request_date": request['created_at'],
                    "request_type": request['request_type'],
                    "description": request['description'],
                    "status": request['status'],
                    "priority": request['priority'],
                    "request_id": request['id']
                })
            
            return customer_history
        except Exception as fallback_error:
            print(f"Fallback query also failed: {fallback_error}")
            return []

# Persistent Customer Request History Functions

def create_persistent_history_entry(original_request_id: str, customer_name: str, room_number: str, 
                                   request_type: str, description: str, priority: str = "normal", 
                                   status: str = "pending", session_token: str = None):
    """Create a persistent history entry for a service request"""
    if not supabase:
        print(f"Would create persistent history entry for request {original_request_id}")
        return None
    
    try:
        result = supabase.table("customer_request_history").insert({
            "original_request_id": original_request_id,
            "customer_name": customer_name,
            "room_number": room_number,
            "request_type": request_type,
            "description": description,
            "priority": priority,
            "status": status,
            "session_token": session_token
        }).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        print(f"Error creating persistent history entry: {e}")
        return None

def update_persistent_history_status(original_request_id: str, status: str, notes: str = None, 
                                    assigned_staff_id: str = None, assigned_by: str = None):
    """Update status of persistent history entry"""
    if not supabase:
        print(f"Would update persistent history for request {original_request_id}")
        return False
    
    try:
        update_data = {"status": status}
        if notes:
            update_data["notes"] = notes
        if assigned_staff_id:
            update_data["assigned_staff_id"] = assigned_staff_id
        if assigned_by:
            update_data["assigned_by"] = assigned_by
            update_data["assigned_at"] = datetime.utcnow().isoformat()
        
        result = supabase.table("customer_request_history").update(update_data).eq(
            "original_request_id", original_request_id
        ).execute()
        return len(result.data) > 0
    except Exception as e:
        print(f"Error updating persistent history: {e}")
        return False

def mark_persistent_history_deleted(original_request_id: str):
    """Mark persistent history entry as deleted when admin deletes the original request"""
    if not supabase:
        print(f"Would mark persistent history as deleted for request {original_request_id}")
        return False
    
    try:
        result = supabase.table("customer_request_history").update({
            "deleted_at": datetime.utcnow().isoformat()
        }).eq("original_request_id", original_request_id).execute()
        return len(result.data) > 0
    except Exception as e:
        print(f"Error marking persistent history as deleted: {e}")
        return False

def get_persistent_customer_history():
    """Get all persistent customer request history"""
    if not supabase:
        print("Would get persistent customer history")
        return []
    
    try:
        # Get persistent history with guest session info for checkout times
        result = supabase.table("customer_request_history").select(
            "*"
        ).order("created_at", desc=True).execute()
        
        if not result.data:
            return []
        
        customer_history = []
        
        # For each history entry, get the checkout time from guest sessions
        for entry in result.data:
            # Get guest session info for checkout time
            guest_session = None
            if entry.get('session_token'):
                session_result = supabase.table("guest_sessions").select("*").eq(
                    "session_token", entry['session_token']
                ).execute()
                if session_result.data:
                    guest_session = session_result.data[0]
            
            customer_history.append({
                "customer_name": entry['customer_name'],
                "room_number": entry['room_number'],
                "checkout_time": guest_session.get('checkout_time') if guest_session else None,
                "request_date": entry['created_at'],
                "request_type": entry['request_type'],
                "description": entry['description'],
                "status": entry['status'],
                "priority": entry['priority'],
                "request_id": entry['original_request_id'],
                "deleted_at": entry.get('deleted_at'),
                "notes": entry.get('notes')
            })
        
        return customer_history
    except Exception as e:
        print(f"Error getting persistent customer history: {e}")
        return []