from datetime import datetime, timedelta, timezone
from db import supabase

# SLA deadlines by urgency
SLA_HOURS = {
    "critical": 24,
    "high": 48,
    "medium": 120,   # 5 days
    "low": 240        # 10 days
}


def check_and_escalate():
    """Background job: check all open grievances for SLA breaches and auto-escalate."""
    try:
        now = datetime.now(timezone.utc).isoformat()

        # Fetch grievances that are open or in_progress and past SLA deadline
        result = supabase.table("grievances") \
            .select("*") \
            .in_("status", ["open", "in_progress", "escalated"]) \
            .lt("sla_deadline", now) \
            .execute()

        grievances = result.data or []
        print(f"[SLA Checker] Found {len(grievances)} breached grievances")

        for g in grievances:
            current_level = g.get("escalation_level", 0)
            new_level = current_level + 1

            # Update grievance
            supabase.table("grievances").update({
                "escalation_level": new_level,
                "status": "escalated"
            }).eq("id", g["id"]).execute()

            # Log escalation
            supabase.table("escalation_log").insert({
                "grievance_id": g["id"],
                "escalated_at": now,
                "escalation_level": new_level,
                "reason": f"SLA breach - deadline was {g.get('sla_deadline', 'unknown')}",
                "auto_triggered": True
            }).execute()

            print(f"[SLA Checker] Escalated grievance {g['id']} to level {new_level}")

    except Exception as e:
        print(f"[SLA Checker] Error: {e}")


def get_sla_deadline(urgency: str) -> str:
    """Calculate SLA deadline based on urgency level."""
    hours = SLA_HOURS.get(urgency, 120)
    deadline = datetime.now(timezone.utc) + timedelta(hours=hours)
    return deadline.isoformat()
