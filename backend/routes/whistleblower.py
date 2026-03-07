import uuid
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from db import supabase
from ai_engine import classify_grievance
from services.sla_checker import get_sla_deadline

router = APIRouter(prefix="/api/whistleblower", tags=["Whistleblower"])


class WhistleblowerReport(BaseModel):
    description: str
    category_hint: str = ""  # Optional hint from user
    district: str = "Unknown"
    language: str = "en"


@router.post("/file")
async def file_whistleblower_report(data: WhistleblowerReport):
    """File an anonymous whistleblower report. No personal data stored."""
    # Generate anonymous tracking token
    tracking_token = str(uuid.uuid4())

    # AI Classification
    ai_result = await classify_grievance(
        "Anonymous Report", data.description, data.language
    )

    sla_deadline = get_sla_deadline(ai_result["urgency"])

    report_data = {
        "tracking_id": tracking_token,
        "title": "Anonymous Whistleblower Report",
        "description": data.description,
        "category": ai_result["category"],
        "urgency": ai_result["urgency"],
        "sentiment_score": ai_result["sentiment_score"],
        "status": "open",
        "language": data.language,
        "district": data.district,
        "is_anonymous": True,
        "is_whistleblower": True,
        "citizen_name": None,
        "citizen_contact": None,
        "sla_deadline": sla_deadline,
        "escalation_level": 1,  # Whistleblower reports start at elevated level
        "summary_en": ai_result.get("summary_en", "Anonymous report"),
    }

    supabase.table("grievances").insert(report_data).execute()

    return {
        "success": True,
        "tracking_token": tracking_token,
        "message": "Your anonymous report has been filed securely. Save your tracking token to check status later.",
        "classification": {
            "category": ai_result["category"],
            "urgency": ai_result["urgency"],
        }
    }


@router.get("/track/{token}")
async def track_whistleblower_report(token: str):
    """Track a whistleblower report anonymously by token."""
    result = supabase.table("grievances") \
        .select("id, status, category, urgency, escalation_level, created_at, sla_deadline, resolved_at") \
        .eq("tracking_id", token) \
        .eq("is_whistleblower", True) \
        .execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Report not found")

    report = result.data[0]

    # Get escalation history (no personal data exposed)
    escalations = supabase.table("escalation_log") \
        .select("escalated_at, escalation_level, reason") \
        .eq("grievance_id", report["id"]) \
        .order("escalated_at", desc=True) \
        .execute()

    return {
        "status": report["status"],
        "category": report["category"],
        "urgency": report["urgency"],
        "escalation_level": report["escalation_level"],
        "created_at": report["created_at"],
        "sla_deadline": report["sla_deadline"],
        "resolved_at": report.get("resolved_at"),
        "escalation_history": escalations.data or []
    }
