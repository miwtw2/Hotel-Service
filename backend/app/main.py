# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import chat, auth

app = FastAPI(title="Hotel Chatbot API", version="1.0")

# CORS settings (allow frontend access)
# In dev, allow all to avoid CORS mishaps; tighten in prod
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router)
app.include_router(auth.router)

# Health check endpoint
@app.get("/")
@app.get("/health")
async def root():
    return {"status": "ok", "message": "Hotel Chatbot API is running"}
