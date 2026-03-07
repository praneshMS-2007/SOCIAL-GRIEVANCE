import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from db import supabase
from ai_engine import classify_grievance
from services.sla_checker import get_sla_deadline
from services.clustering import check_and_cluster

router = APIRouter(prefix="/api/grievances", tags=["Grievances"])


class GrievanceCreate(BaseModel):
    title: str
    description: str
    language: str = "en"  # en, hi, ta
    location: Optional[str] = None
    district: str = "Unknown"
    citizen_name: Optional[str] = None
    citizen_contact: Optional[str] = None
    is_anonymous: bool = False


class GrievanceResolve(BaseModel):
    resolution_notes: str


class QualityRating(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None


@router.post("")
async def file_grievance(data: GrievanceCreate):
    """File a new grievance. AI classifies it automatically."""
    # AI Classification
    ai_result = await classify_grievance(data.title, data.description, data.language)

    tracking_id = str(uuid.uuid4())[:8].upper()
    sla_deadline = get_sla_deadline(ai_result["urgency"])

    grievance_data = {
        "tracking_id": tracking_id,
        "title": data.title,
        "description": data.description,
        "category": ai_result["category"],
        "urgency": ai_result["urgency"],
        "sentiment_score": ai_result["sentiment_score"],
        "status": "open",
        "language": data.language,
        "location": data.location,
        "district": data.district,
        "is_anonymous": data.is_anonymous,
        "is_whistleblower": False,
        "citizen_name": None if data.is_anonymous else data.citizen_name,
        "citizen_contact": None if data.is_anonymous else data.citizen_contact,
        "sla_deadline": sla_deadline,
        "escalation_level": 0,
        "summary_en": ai_result.get("summary_en", data.title),
    }

    result = supabase.table("grievances").insert(grievance_data).execute()
    grievance = result.data[0]

    # Background: check for clustering
    await check_and_cluster(
        grievance["id"], ai_result["category"], data.district, data.description
    )

    return {
        "success": True,
        "tracking_id": tracking_id,
        "grievance_id": grievance["id"],
        "classification": {
            "category": ai_result["category"],
            "urgency": ai_result["urgency"],
            "sentiment_score": ai_result["sentiment_score"],
        },
        "sla_deadline": sla_deadline,
        "message": f"Grievance filed successfully. Your tracking ID is {tracking_id}"
    }


@router.get("")
async def list_grievances(
    status: Optional[str] = None,
    category: Optional[str] = None,
    district: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
):
    """List grievances with optional filters."""
    query = supabase.table("grievances") \
        .select("*") \
        .eq("is_whistleblower", False) \
        .order("created_at", desc=True) \
        .range(offset, offset + limit - 1)

    if status:
        query = query.eq("status", status)
    if category:
        query = query.eq("category", category)
    if district:
        query = query.eq("district", district)

    result = query.execute()
    return {"grievances": result.data or [], "count": len(result.data or [])}


@router.get("/track/{tracking_id}")
async def track_grievance(tracking_id: str):
    """Track a grievance by its tracking ID."""
    result = supabase.table("grievances") \
        .select("*") \
        .eq("tracking_id", tracking_id) \
        .execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Grievance not found")

    grievance = result.data[0]

    # Get escalation history
    escalations = supabase.table("escalation_log") \
        .select("*") \
        .eq("grievance_id", grievance["id"]) \
        .order("escalated_at", desc=True) \
        .execute()

    return {
        "grievance": grievance,
        "escalation_history": escalations.data or []
    }


@router.get("/{grievance_id}")
async def get_grievance(grievance_id: str):
    """Get grievance details by ID."""
    result = supabase.table("grievances") \
        .select("*") \
        .eq("id", grievance_id) \
        .execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Grievance not found")

    grievance = result.data[0]

    # Get escalation history
    escalations = supabase.table("escalation_log") \
        .select("*") \
        .eq("grievance_id", grievance_id) \
        .order("escalated_at", desc=True) \
        .execute()

    return {
        "grievance": grievance,
        "escalation_history": escalations.data or []
    }


@router.patch("/{grievance_id}/resolve")
async def resolve_grievance(grievance_id: str, data: GrievanceResolve):
    """Mark a grievance as resolved."""
    now = datetime.now(timezone.utc).isoformat()
    supabase.table("grievances").update({
        "status": "resolved",
        "resolution_notes": data.resolution_notes,
        "resolved_at": now
    }).eq("id", grievance_id).execute()

    return {"success": True, "message": "Grievance marked as resolved"}


@router.post("/{grievance_id}/rate")
async def rate_grievance(grievance_id: str, data: QualityRating):
    """Rate the resolution quality. Auto-reopens if rating < 2."""
    try:
        update_data = {"quality_rating": data.rating}

        if data.rating < 2:
            # Auto-reopen
            update_data["status"] = "reopened"
            try:
                supabase.table("escalation_log").insert({
                    "grievance_id": grievance_id,
                    "escalation_level": 1,
                    "reason": f"Low quality rating ({data.rating}/5) - auto-reopened",
                    "auto_triggered": True
                }).execute()
            except Exception as esc_err:
                print(f"Escalation log insert warning: {esc_err}")
            message = "Grievance has been automatically reopened due to low quality rating."
        else:
            message = "Thank you for your feedback."

        supabase.table("grievances").update(update_data).eq("id", grievance_id).execute()
        return {"success": True, "message": message, "reopened": data.rating < 2}
    except Exception as e:
        print(f"❌ Rate endpoint error for {grievance_id}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
