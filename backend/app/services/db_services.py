import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Predefined responses for quick requests
PREDEFINED_RESPONSES = {
    "🛏️ Request Housekeeping": "Housekeeping will arrive shortly.",
    "🧴 Extra Towels": "Extra towels are on their way to your room.",
    "🍽️ Room Service Menu": "You can view the room service menu at: https://hotel.example.com/menu",
    "⏰ Check-Out Time": "Check-out time is at 12:00 PM.",
    "📶 Wi-Fi Info": "Wi-Fi SSID: HotelGuest | Password: Welcome123"
}

def log_message(room_number: str, message: str, sender: str):
    """Insert a chat message into Supabase"""
    supabase.table("chat_messages").insert({
        "room_number": room_number,
        "message": message,
        "sender": sender
    }).execute()

def get_messages(room_number: str):
    """Fetch all messages for a room"""
    response = supabase.table("chat_messages").select("*").eq("room_number", room_number).execute()
    return response.data

def handle_quick_request(room_number: str, request: str) -> str:
    """Log quick request and return AI-friendly response"""
    # Log guest request
    log_message(room_number, request, "guest")

    # Get predefined response if available
    reply = PREDEFINED_RESPONSES.get(request, "Your request has been sent to the staff.")
    
    # Log AI response
    log_message(room_number, reply, "ai")
    
    return reply
