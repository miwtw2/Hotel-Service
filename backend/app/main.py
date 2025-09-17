# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import chat, requests

app = FastAPI(title="Hotel Chatbot API", version="1.0")

# CORS settings (allow frontend access)
origins = [
    "http://localhost:3000",  # React dev server
    "http://127.0.0.1:3000",
    # Add production frontend URL here
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router)
app.include_router(requests.router)

# Health check endpoint
@app.get("/")
async def root():
    return {"status": "ok", "message": "Hotel Chatbot API is running"}
