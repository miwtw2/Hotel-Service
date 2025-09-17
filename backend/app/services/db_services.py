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

def verify_session_token(session_token: str) -> dict:
    """Verify session token and return session info"""
    if not supabase:
        return {
            "valid": True,
            "room_number": "101",
            "guest_name": "Demo Guest"
        }
    
    try:
        result = supabase.table("guest_sessions").select("*").eq(
            "session_token", session_token
        ).eq("is_active", True).gte(
            "expires_at", datetime.now().isoformat()
        ).execute()
        
        if result.data:
            session = result.data[0]
            return {
                "valid": True,
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
