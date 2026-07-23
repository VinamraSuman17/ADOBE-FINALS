from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.routes import router, SESSION_STORAGE  # ✅ FIXED IMPORT PATH
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent  # backend/
STORAGE_DIR = BASE_DIR / "storage"

# Create storage directories synchronously before mounting them
(STORAGE_DIR / "audio").mkdir(parents=True, exist_ok=True)
(STORAGE_DIR / "pdfs").mkdir(parents=True, exist_ok=True)
(STORAGE_DIR / "temp").mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title="Adobe Challenge - AI-Powered PDF Analysis with Preview",
    description="Advanced document intelligence with Gemini AI integration, cross-document insights, podcast generation, and PDF preview",
    version="6.0.0-adobe-gemini-deep-pdf-preview"
)

# ✅ STARTUP EVENT - SESSION MANAGEMENT
@app.on_event("startup")
async def startup_event():
    """Initialize application with session management"""
    print("🚀 Adobe Challenge - AI-Powered PDF Analysis starting up...")
    print("📁 Creating storage directories...")
    
    # Create storage directories
    create_storage_directories()
    
    # ✅ CLEAR SESSION STORAGE FOR DEV MODE
    print("🧹 Clearing session storage for fresh start...")
    SESSION_STORAGE.clear()
    print(f"📊 Session storage cleared. Active sessions: {len(SESSION_STORAGE)}")
    
    print("🤖 Gemini AI integration active")
    print("👁️ PDF Preview functionality enabled")
    print("🎧 Advanced podcast functionality enabled")
    print("✅ Deep document intelligence ready!")
    print("🌐 Server running on: http://localhost:8080")
    print("📖 API Documentation: http://localhost:8080/docs")
    
    # Check Gemini configuration
    if os.environ.get("GEMINI_API_KEY"):
        print("🤖 Gemini AI: CONFIGURED ✅")
    else:
        print("⚠️ Gemini AI: NOT CONFIGURED - Set GEMINI_API_KEY environment variable")

# ✅ Create necessary directories for file storage
def create_storage_directories():
    """Create storage directories if they don't exist"""
    directories = [
        "storage",
        "storage/pdfs", 
        "storage/audio",
        "storage/temp"
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"📁 Created directory: {directory}")

# ✅ Enhanced CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Mount static files
app.mount("/audio", StaticFiles(directory=STORAGE_DIR / "audio"), name="audio")
app.mount("/pdfs", StaticFiles(directory=STORAGE_DIR / "pdfs"), name="pdfs")
app.mount("/temp", StaticFiles(directory=STORAGE_DIR / "temp"), name="temp")

# Include API routes
app.include_router(router, prefix="", tags=["Adobe Challenge - Deep AI"])

# ✅ DEBUG ENDPOINTS
@app.get("/debug/storage")
async def debug_storage():
    """Debug endpoint to check storage status"""
    import os
    
    storage_info = {}
    directories = ["storage/pdfs", "storage/audio", "storage/temp"]
    
    for directory in directories:
        if os.path.exists(directory):
            files = os.listdir(directory)
            storage_info[directory] = {
                "exists": True,
                "files_count": len(files),
                "files": files[:10],
                "writable": os.access(directory, os.W_OK)
            }
        else:
            storage_info[directory] = {
                "exists": False,
                "files_count": 0,
                "files": [],
                "writable": False
            }
    
    return {
        "storage": storage_info,
        "sessions_count": len(SESSION_STORAGE),
        "total_sessions": len(SESSION_STORAGE)
    }

@app.get("/debug/clear-sessions")
async def clear_all_sessions():
    """Clear all sessions (dev only)"""
    count = len(SESSION_STORAGE)
    SESSION_STORAGE.clear()
    return {
        "message": f"Cleared {count} sessions", 
        "remaining_sessions": len(SESSION_STORAGE),
        "status": "success"
    }

# ✅ Root endpoint
@app.get("/")
async def root():
    gemini_status = "configured" if os.environ.get("GEMINI_API_KEY") else "not configured"
    
    return {
        "message": "Adobe Challenge - AI-Powered PDF Analysis API with Preview", 
        "status": "running",
        "active_sessions": len(SESSION_STORAGE),
        "gemini_status": gemini_status,
        "port": 8080,
        "documentation": "http://localhost:8080/docs"
    }

# ✅ Health check
@app.get("/health/")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "Adobe Challenge API with Deep Gemini AI and PDF Preview operational",
        "sessions": len(SESSION_STORAGE),
        "version": "6.0.0-adobe-gemini-deep-pdf-preview"
    }

if __name__ == "__main__":
    import uvicorn
    
    print("🎯 Starting Adobe Challenge - AI-Powered PDF Analysis with Preview...")
    print("🔗 Frontend should connect to: http://localhost:8080")
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8080,
        reload=False,
        log_level="info"
    )
