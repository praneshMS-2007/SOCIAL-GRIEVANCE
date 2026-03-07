from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from apscheduler.schedulers.background import BackgroundScheduler
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="AI Grievance Router & SLA Engine",
    description="SC-02: AI-Powered Grievance Router and SLA Accountability Engine for Public Services",
    version="1.0.0"
)

# CORS - allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handler — ensures CORS headers are always sent even on errors
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"❌ Unhandled error: {type(exc).__name__}: {exc}")
    error_msg = str(exc)
    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": "true",
    }
    if "42P01" in error_msg or "relation" in error_msg.lower() or "404" in error_msg:
        return JSONResponse(
            status_code=503,
            headers=cors_headers,
            content={
                "error": "Database tables not created yet. Please run schema.sql in your Supabase SQL Editor.",
                "setup_required": True,
            }
        )
    return JSONResponse(
        status_code=500,
        headers=cors_headers,
        content={"error": f"Internal server error: {error_msg}"}
    )


# Register routers
from routes.grievances import router as grievances_router
from routes.whistleblower import router as whistleblower_router
from routes.lawyer_bot import router as lawyer_bot_router
from routes.dashboard import router as dashboard_router
from routes.public_api import router as public_api_router
from routes.auth import router as auth_router

app.include_router(grievances_router)
app.include_router(whistleblower_router)
app.include_router(lawyer_bot_router)
app.include_router(dashboard_router)
app.include_router(public_api_router)
app.include_router(auth_router)

# SLA Checker Background Scheduler
scheduler = BackgroundScheduler()


@app.on_event("startup")
def startup_event():
    from services.sla_checker import check_and_escalate
    scheduler.add_job(check_and_escalate, "interval", minutes=15, id="sla_checker")
    scheduler.start()
    print("✅ SLA Checker scheduler started (runs every 15 min)")


@app.on_event("shutdown")
def shutdown_event():
    scheduler.shutdown()


@app.get("/")
async def root():
    return {
        "name": "AI Grievance Router & SLA Engine",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "file_grievance": "POST /api/grievances",
            "track_grievance": "GET /api/grievances/track/{tracking_id}",
            "list_grievances": "GET /api/grievances",
            "whistleblower_file": "POST /api/whistleblower/file",
            "whistleblower_track": "GET /api/whistleblower/track/{token}",
            "lawyer_bot": "POST /api/lawyer-bot/ask",
            "dashboard_stats": "GET /api/dashboard/stats",
            "dashboard_clusters": "GET /api/dashboard/clusters",
            "public_api": "GET /api/public/grievances",
        }
    }


@app.get("/api/health")
async def health():
    return {"status": "healthy"}
