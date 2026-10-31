import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Load environment variables
load_dotenv()

from app.routers import documents_router, claims_router, verification_router

app = FastAPI(
    title="IntelliDoc AI Runtime API",
    description="Evidence-Driven Explainable Multimodal Document Intelligence & Verification System",
    version="1.0.0"
)

# Configure CORS for frontend access
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
if allowed_origins_env == "*":
    origins = ["*"]
else:
    origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]
    origins.extend([
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(documents_router)
app.include_router(claims_router)
app.include_router(verification_router)

# Ensure database tables exist on startup
from app.database import engine, Base
from app.models import models as app_models  # noqa: F401

try:
    Base.metadata.create_all(bind=engine)
    print("Database tables initialized successfully.")
except Exception as e:
    print(f"Database initialization notice: {e}")

# Mount uploads directory for static asset viewing
upload_dir = Path(os.getenv("UPLOAD_DIR", "uploads")).resolve()
upload_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(upload_dir)), name="uploads")


@app.get("/")
def root():
    return {
        "service": "IntelliDoc AI Runtime API",
        "status": "online",
        "docs": "/docs",
        "health": "/health",
        "version": "1.0.0"
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "message": "IntelliDoc AI Backend is running",
        "service": "IntelliDoc Verification Engine"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
