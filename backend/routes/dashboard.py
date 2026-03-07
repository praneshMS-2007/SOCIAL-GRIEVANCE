from fastapi import APIRouter
from db import supabase

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats")
async def get_dashboard_stats():
    """Get aggregated public accountability stats."""
    try:
        # Total grievances
        all_grievances = supabase.table("grievances") \
            .select("id, category, status, urgency, created_at, resolved_at, sla_deadline, escalation_level, quality_rating, district") \
            .eq("is_whistleblower", False) \
            .execute()

        grievances = all_grievances.data or []
        total = len(grievances)

        if total == 0:
            return {
                "total_grievances": 0,
                "resolved": 0,
                "open": 0,
                "escalated": 0,
                "resolution_rate": 0,
                "avg_quality_rating": 0,
                "department_stats": [],
                "district_stats": []
            }

        # Count by status
        resolved = sum(1 for g in grievances if g["status"] == "resolved")
        open_count = sum(1 for g in grievances if g["status"] in ["open", "in_progress"])
        escalated = sum(1 for g in grievances if g["status"] == "escalated")
        reopened = sum(1 for g in grievances if g["status"] == "reopened")

        # Average quality rating
        rated = [g["quality_rating"] for g in grievances if g.get("quality_rating")]
        avg_rating = round(sum(rated) / len(rated), 1) if rated else 0

        # SLA breach count
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        sla_breached = 0
        for g in grievances:
            if g["status"] not in ["resolved"] and g.get("sla_deadline"):
                try:
                    deadline = datetime.fromisoformat(g["sla_deadline"].replace("Z", "+00:00"))
                    if now > deadline:
                        sla_breached += 1
                except:
                    pass

        # Department-wise stats
        dept_map = {}
        for g in grievances:
            cat = g["category"]
            if cat not in dept_map:
                dept_map[cat] = {"total": 0, "resolved": 0, "escalated": 0, "breached": 0}
            dept_map[cat]["total"] += 1
            if g["status"] == "resolved":
                dept_map[cat]["resolved"] += 1
            if g["status"] == "escalated":
                dept_map[cat]["escalated"] += 1

        department_stats = []
        for dept, stats in dept_map.items():
            department_stats.append({
                "department": dept,
                "total": stats["total"],
                "resolved": stats["resolved"],
                "escalated": stats["escalated"],
                "resolution_rate": round((stats["resolved"] / stats["total"]) * 100, 1) if stats["total"] > 0 else 0
            })

        # District-wise stats
        dist_map = {}
        for g in grievances:
            dist = g.get("district", "Unknown")
            if dist not in dist_map:
                dist_map[dist] = {"total": 0, "resolved": 0}
            dist_map[dist]["total"] += 1
            if g["status"] == "resolved":
                dist_map[dist]["resolved"] += 1

        district_stats = [
            {
                "district": d,
                "total": s["total"],
                "resolved": s["resolved"],
                "resolution_rate": round((s["resolved"] / s["total"]) * 100, 1) if s["total"] > 0 else 0
            }
            for d, s in dist_map.items()
        ]

        return {
            "total_grievances": total,
            "resolved": resolved,
            "open": open_count,
            "escalated": escalated,
            "reopened": reopened,
            "sla_breached": sla_breached,
            "resolution_rate": round((resolved / total) * 100, 1) if total > 0 else 0,
            "avg_quality_rating": avg_rating,
            "department_stats": sorted(department_stats, key=lambda x: x["total"], reverse=True),
            "district_stats": sorted(district_stats, key=lambda x: x["total"], reverse=True),
        }

    except Exception as e:
        print(f"Dashboard stats error: {e}")
        return {"error": str(e)}


@router.get("/clusters")
async def get_systemic_clusters():
    """Get active systemic issue clusters."""
    try:
        result = supabase.table("clusters") \
            .select("*") \
            .eq("is_systemic", True) \
            .order("grievance_count", desc=True) \
            .execute()

        return {"clusters": result.data or []}
    except Exception as e:
        return {"clusters": [], "error": str(e)}
