# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import chat, auth, admin, guest

app = FastAPI(title="Hotel Service API", version="1.0.0")

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
app.include_router(admin.router)
app.include_router(guest.router)

# Health check endpoint
@app.get("/")
@app.get("/health")
async def root():
    return {"status": "ok", "message": "Hotel Service API is running"}
