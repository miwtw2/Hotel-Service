import os
from openai import OpenAI
from dotenv import load_dotenv
from app.services.db_services import log_message

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    # Allow startup but reply with a clear error message when called
    client = None
else:
    client = OpenAI(api_key=OPENAI_API_KEY)

# Hotel info for quick replies
hotel_info = {
    "wifi": os.getenv("WIFI_PASSWORD", "HotelGuest123"),
    "checkout": os.getenv("CHECKOUT_TIME", "12:00 PM")
}

# Enhanced system prompt with follow-up behavior
system_prompt = """
You are a virtual hotel concierge assistant for a luxury hotel. Your goal is to help guests quickly and politely with any questions or requests they may have. 
Always use a professional, friendly, and courteous tone. Be concise but informative. 

You can handle:
- Hotel information (Wi-Fi, check-in/out times, pool hours, amenities)
- Service requests (extra towels, housekeeping, room service, reservations)
- Local recommendations (restaurants, attractions, transport)
- General guidance for guest comfort

For service requests, always confirm the guest's request and indicate that staff will handle it. 
Example: "Your request for 2 extra towels has been sent to housekeeping. They will deliver them shortly."
If the guest request is unclear, politely ask for clarification.
Maintain a consistent, helpful, and human-like personality.
"""

# List of requests that require staff follow-up
staff_requests = ["towel", "housekeeping", "room service", "cleaning", "maintenance"]

def get_ai_response(user_text: str, room_number: str = "Unknown") -> str:
    text_lower = user_text.lower()

    # Rule-based quick answers
    if "wifi" in text_lower:
        reply = f"Here is your Wi-Fi password: {hotel_info['wifi']}"
        log_message(room_number, user_text, "guest")
        log_message(room_number, reply, "ai")
        return reply

    if "check-out" in text_lower or "checkout" in text_lower:
        reply = f"Check-out time is {hotel_info['checkout']}"
        log_message(room_number, user_text, "guest")
        log_message(room_number, reply, "ai")
        return reply

    # Detect staff requests
    if any(word in text_lower for word in staff_requests):
        print(f"🛎️ New Request from Room {room_number}: {user_text}")
        reply = f"Your request has been sent to the hotel staff. They will handle it shortly."
        log_message(room_number, user_text, "guest")
        log_message(room_number, reply, "ai")
        return reply

    # AI fallback using GPT-3.5 (or any configured model)
    if client is None:
        ai_reply = (
            "AI is not configured (missing OPENAI_API_KEY). "
            "Please set the backend .env and restart the server."
        )
    else:
        try:
            completion = client.chat.completions.create(
                model=os.getenv("OPENAI_MODEL", "gpt-3.5-turbo"),
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_text}
                ]
            )
            ai_reply = (completion.choices[0].message.content or "").strip()
            if not ai_reply:
                ai_reply = "I'm sorry, I couldn't generate a response just now. Please try again."
        except Exception as e:
            ai_reply = f"AI error: {e}"
    
    # Log guest message and AI reply
    try:
        log_message(room_number, user_text, "guest")
        log_message(room_number, ai_reply, "ai")
    except Exception:
        # Don't break reply if logging fails
        pass
    
    return ai_reply
