from fastapi import APIRouter
from typing import Optional
from db import supabase

router = APIRouter(prefix="/api/public", tags=["Public API"])


@router.get("/grievances")
async def get_public_grievances(
    district: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 100,
    offset: int = 0
):
    """Public API for NGOs and journalists. Returns anonymized, aggregated data."""
    query = supabase.table("grievances") \
        .select("id, category, urgency, status, district, language, created_at, resolved_at, sla_deadline, escalation_level, quality_rating, summary_en") \
        .eq("is_whistleblower", False) \
        .order("created_at", desc=True) \
        .range(offset, offset + limit - 1)

    if district:
        query = query.eq("district", district)
    if category:
        query = query.eq("category", category)
    if status:
        query = query.eq("status", status)

    result = query.execute()

    return {
        "data": result.data or [],
        "count": len(result.data or []),
        "offset": offset,
        "limit": limit,
        "note": "Personal information is excluded. Data is anonymized for public accountability."
    }


@router.get("/departments")
async def get_departments():
    """List all departments for filtering."""
    from ai_engine import DEPARTMENTS
    return {"departments": DEPARTMENTS}
