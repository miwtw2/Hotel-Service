import os
import re
import google.generativeai as genai
from dotenv import load_dotenv
from app.services.db_services import log_message, create_service_request, get_requests_by_room, get_active_requests_by_room, cancel_service_request
from typing import Dict, Optional, Tuple, List

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    # Allow startup but reply with a clear error message when called
    model = None
else:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')

# Hotel info for quick replies
hotel_info = {
    "wifi": os.getenv("WIFI_PASSWORD", "HotelGuest123"),
    "checkout": os.getenv("CHECKOUT_TIME", "12:00 PM")
}

# Enhanced system prompt with comprehensive service request handling
system_prompt = """
You are a virtual hotel concierge assistant for a luxury hotel. Your goal is to help guests quickly and politely with any questions or requests they may have. 
Always use a professional, friendly, and courteous tone. Be concise but informative.

IMPORTANT INSTRUCTIONS FOR SERVICE REQUESTS:
When a guest makes any service request, you must:
1. Identify the type of service from these categories:
   - housekeeping: room cleaning, tidying, fresh sheets, making bed
   - towels: bath towels, hand towels, washcloths
   - room_service: food orders, meals, dining
   - refreshments: coffee, tea, drinks, snacks, mini bar items
   - maintenance: broken items, repairs, plumbing, electrical issues
   - tech_support: TV, remote, wifi, phone, technical problems
   - amenities: pillows, blankets, toiletries, robes, slippers
   - transportation: taxi, rides, airport transfer, shuttle
   - local_info: restaurant recommendations, attractions, directions
   - concierge: reservations, bookings, event tickets

2. Respond with this EXACT format: "SERVICE_REQUEST|[category]|[description]|[priority]"
   - category: one of the above categories
   - description: clean, simple description of what guest needs
   - priority: "normal" or "urgent" (use "urgent" for maintenance and critical issues)

3. After the special format, provide a natural response to the guest.

CANCELLATION REQUESTS:
When a guest wants to cancel a request, respond with: "CANCEL_REQUEST|[reason]"
Then provide a natural response about checking their requests.

EXAMPLES:
Guest: "I need some towels please"
Response: "SERVICE_REQUEST|towels|Fresh towels for room|normal
Absolutely! I've requested fresh towels for your room. Housekeeping will deliver them within the next 15-20 minutes."

Guest: "The TV is not working"
Response: "SERVICE_REQUEST|tech_support|TV not working properly|urgent
I'm sorry to hear your TV isn't working. I've notified our technical support team and they'll be with you shortly to resolve this issue."

Guest: "Cancel my request"
Response: "CANCEL_REQUEST|Guest requested cancellation via chat
I'll help you with cancelling your request. Let me check what active requests you have."

For all other inquiries (wifi password, checkout times, general questions), respond normally without the special format.
"""

# Comprehensive service request detection patterns
service_request_patterns = {
    "housekeeping": {
        "keywords": ["housekeeping", "clean", "cleaning", "tidy", "vacuum", "dusting", "fresh sheets", "make bed"],
        "priority": "normal"
    },
    "towels": {
        "keywords": ["towel", "towels", "bath towel", "hand towel", "washcloth"],
        "priority": "normal"
    },
    "room_service": {
        "keywords": ["room service", "food", "meal", "hungry", "order", "menu", "breakfast", "lunch", "dinner"],
        "priority": "normal"
    },
    "refreshments": {
        "keywords": ["drink", "beverage", "water", "coffee", "tea", "juice", "soda", "snack", "snacks", "ice", "mini bar"],
        "priority": "normal"
    },
    "maintenance": {
        "keywords": ["broken", "fix", "repair", "maintenance", "not working", "problem with", "issue with", "toilet", "shower", "air conditioning", "ac", "heating", "light", "lamp", "plumbing", "electrical"],
        "priority": "urgent"
    },
    "tech_support": {
        "keywords": ["tv", "television", "remote", "wifi", "internet", "phone", "charging", "cable", "tech support", "technical", "computer", "laptop"],
        "priority": "normal"
    },
    "amenities": {
        "keywords": ["pillow", "pillows", "blanket", "blankets", "amenities", "toiletries", "shampoo", "soap", "toothbrush", "robe", "slippers"],
        "priority": "normal"
    },
    "transportation": {
        "keywords": ["taxi", "cab", "uber", "lyft", "car", "ride", "airport transfer", "shuttle", "transportation", "pick up", "drop off"],
        "priority": "normal"
    },
    "local_info": {
        "keywords": ["directions", "map", "local", "nearby", "recommend", "attraction", "museum", "shopping", "restaurant recommendations", "things to do", "area info"],
        "priority": "normal"
    },
    "concierge": {
        "keywords": ["reservation", "book", "booking", "restaurant booking", "show tickets", "tour", "concierge", "arrange", "event tickets"],
        "priority": "normal"
    }
}

def detect_service_request_from_text(user_text: str) -> Optional[Tuple[str, str, str]]:
    """
    Detect service requests directly from user text as a fallback.
    Returns tuple of (category, description, priority) or None if no service detected.
    """
    text_lower = user_text.lower()
    
    # First, check for clear service request action phrases (these override question filtering)
    service_action_phrases = [
        "can you bring me", "can you send me", "could you bring me", "could you send me",
        "please bring me", "please send me", "bring me some", "send me some",
        "i need", "i would like", "i want", "i require", "i'd like",
        "please bring", "please send", "please provide", "deliver",
        "fix", "repair", "clean", "replace", "change"
    ]
    
    has_service_action = False
    for phrase in service_action_phrases:
        if phrase in text_lower:
            has_service_action = True
            break
    
    # If no service action found, check if it's an informational question
    if not has_service_action:
        question_patterns = [
            "what is", "what are", "what time", "what does", "what do",
            "where is", "where are", "where can", "where do",
            "when is", "when are", "when does", "when do", 
            "how much", "how long", "how do", "how does",
            "why is", "why are", "why does", "why do",
            "which is", "which are", "who is", "who are",
            "tell me about", "explain", "info about", "information about",
            "do you have", "does the hotel have", "is there", "are there",
            "do you offer", "does the hotel offer",
            "what amenities", "what services", "what facilities"
        ]
        
        # If it's clearly a question, don't treat as service request
        for pattern in question_patterns:
            if pattern in text_lower:
                return None
        
        # Also exclude if it ends with question mark
        if user_text.strip().endswith('?'):
            return None
        
        # No service action and no clear question pattern - probably not a service request
        return None
    
    # We have a service action, so check for service categories
    for category, config in service_request_patterns.items():
        for keyword in config["keywords"]:
            if keyword in text_lower:
                # Found a match - create description and priority
                description = user_text.strip()
                priority = config["priority"]
                return (category, description, priority)
    
    # If we have action words but no specific category, default to concierge
    return ("concierge", user_text.strip(), "normal")

def process_ai_response(ai_reply: str, user_text: str, room_number: str, session_token: str = None) -> str:
    """Process AI response to handle service requests and cancellations."""
    
    # Check for service request format in AI response
    if "SERVICE_REQUEST|" in ai_reply:
        parts = ai_reply.split("SERVICE_REQUEST|", 1)
        if len(parts) > 1:
            service_part = parts[1]
            natural_response = parts[0].strip() if parts[0].strip() else ""
            
            # Parse service request components
            service_lines = service_part.split('\n', 1)
            service_data = service_lines[0].strip()
            remaining_text = service_lines[1] if len(service_lines) > 1 else ""
            
            # Extract service request details
            service_components = service_data.split('|')
            if len(service_components) >= 3:
                category = service_components[0].strip()
                description = service_components[1].strip()
                priority = service_components[2].strip() if len(service_components) > 2 else "normal"
                
                try:
                    # Create service request in database
                    result = create_service_request(
                        room_number=room_number,
                        request_type=category,
                        description=description,
                        priority=priority,
                        session_token=session_token
                    )
                    
                    if result:
                        # Return natural response + remaining AI text
                        combined_response = remaining_text.strip() if remaining_text.strip() else natural_response
                        if not combined_response:
                            combined_response = f"I've submitted your {category} request. Our team will assist you shortly!"
                        return combined_response
                    else:
                        return f"I understand you need {description}, but I'm having trouble creating the request right now. Please contact the front desk directly."
                        
                except Exception as e:
                    return f"I understand you need {description}. Let me connect you with our staff who can help you right away."
    
    # Check for cancellation request
    elif "CANCEL_REQUEST|" in ai_reply:
        parts = ai_reply.split("CANCEL_REQUEST|", 1)
        if len(parts) > 1:
            cancel_part = parts[1]
            natural_response = parts[0].strip() if parts[0].strip() else ""
            
            # Parse cancellation reason
            cancel_lines = cancel_part.split('\n', 1)
            cancel_reason = cancel_lines[0].strip()
            remaining_text = cancel_lines[1] if len(cancel_lines) > 1 else ""
            
            try:
                # Get active requests for the room
                active_requests = get_active_requests_by_room(room_number)
                
                if active_requests and len(active_requests) > 0:
                    # Cancel the most recent active request
                    latest_request = active_requests[0]
                    cancel_result = cancel_service_request(
                        request_id=latest_request["id"],
                        cancelled_by="guest",
                        reason=cancel_reason
                    )
                    
                    if cancel_result.get("success"):
                        response = remaining_text.strip() if remaining_text.strip() else natural_response
                        if not response:
                            response = f"I've cancelled your {latest_request['service_type']} request. Is there anything else I can help you with?"
                        return response
                    else:
                        return "I'm having trouble cancelling your request. Please contact the front desk for assistance."
                else:
                    return "I don't see any active requests to cancel. If you need help with something else, please let me know!"
                    
            except Exception as e:
                return "I'm having trouble accessing your requests right now. Please contact the front desk to cancel any requests."
    
    # Return original AI response if no special processing needed
    return ai_reply

def get_ai_response(user_text: str, room_number: str = "Unknown", session_token: str = None) -> str:
    text_lower = user_text.lower()

    # Rule-based quick answers for basic hotel info
    if "wifi" in text_lower and "password" in text_lower:
        reply = f"Here is your Wi-Fi password: {hotel_info['wifi']}"
        log_message(room_number, user_text, "guest")
        log_message(room_number, reply, "bot")
        return reply

    if "check-out" in text_lower or "checkout" in text_lower:
        reply = f"Check-out time is {hotel_info['checkout']}"
        log_message(room_number, user_text, "guest")
        log_message(room_number, reply, "bot")
        return reply

    # Use AI with system prompt for all other requests
    if model is None:
        ai_reply = (
            "AI is not configured (missing GEMINI_API_KEY). "
            "Please set the backend .env and restart the server."
        )
    else:
        try:
            # Combine system prompt with user message for Gemini
            full_prompt = f"{system_prompt}\n\nGuest from Room {room_number}: {user_text}\nAssistant:"
            response = model.generate_content(full_prompt)
            ai_reply = (response.text or "").strip()
            if not ai_reply:
                ai_reply = "I'm sorry, I couldn't generate a response just now. Please try again."
        except Exception as e:
            ai_reply = f"AI error: {e}"

    # Process AI response for service requests and cancellations
    processed_reply = process_ai_response(ai_reply, user_text, room_number, session_token)
    
    # FALLBACK: If AI didn't create a service request but user text suggests one, create it manually
    if "SERVICE_REQUEST|" not in ai_reply and "CANCEL_REQUEST|" not in ai_reply:
        service_detection = detect_service_request_from_text(user_text)
        if service_detection:
            category, description, priority = service_detection
            try:
                result = create_service_request(
                    room_number=room_number,
                    request_type=category,
                    description=description,
                    priority=priority,
                    session_token=session_token
                )
                
                if result:
                    # Enhance the AI reply to acknowledge the service request
                    processed_reply = f"{processed_reply}\n\nI've also submitted your {category} request to our team. They'll assist you shortly!"
            except Exception as e:
                # Don't break the response if service request creation fails
                pass
    
    # Log guest message and AI reply
    try:
        log_message(room_number, user_text, "guest")
        log_message(room_number, processed_reply, "bot")
    except Exception:
        # Don't break reply if logging fails
        pass
    
    return processed_reply
