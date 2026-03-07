from db import supabase
from ai_engine import check_similarity

CLUSTER_THRESHOLD = 10  # Configurable: minimum similar grievances to flag as systemic


async def check_and_cluster(grievance_id: str, category: str, district: str, description: str):
    """Check if a new grievance should be clustered with similar ones."""
    try:
        # Find existing grievances in same category + district from last 30 days
        from datetime import datetime, timedelta, timezone
        thirty_days_ago = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()

        result = supabase.table("grievances") \
            .select("id, description") \
            .eq("category", category) \
            .eq("district", district) \
            .gte("created_at", thirty_days_ago) \
            .neq("id", grievance_id) \
            .execute()

        similar_grievances = result.data or []

        if len(similar_grievances) < CLUSTER_THRESHOLD - 1:
            return None  # Not enough grievances to form a cluster

        # Use AI to verify similarity
        existing_descriptions = [g["description"] for g in similar_grievances[:10]]
        similarity = await check_similarity(description, existing_descriptions)

        if similarity < 0.5:
            return None  # Not similar enough

        # Check if a cluster already exists for this category + district
        cluster_result = supabase.table("clusters") \
            .select("*") \
            .eq("category", category) \
            .eq("district", district) \
            .eq("is_systemic", True) \
            .execute()

        existing_clusters = cluster_result.data or []

        if existing_clusters:
            # Update existing cluster
            cluster = existing_clusters[0]
            new_count = cluster["grievance_count"] + 1
            supabase.table("clusters").update({
                "grievance_count": new_count
            }).eq("id", cluster["id"]).execute()

            # Add to cluster members
            supabase.table("cluster_members").insert({
                "cluster_id": cluster["id"],
                "grievance_id": grievance_id
            }).execute()

            cluster_id = cluster["id"]
        else:
            # Create new cluster
            cluster_data = {
                "category": category,
                "district": district,
                "description": f"Systemic issue: Multiple {category} complaints in {district}",
                "grievance_count": len(similar_grievances) + 1,
                "is_systemic": True
            }
            new_cluster = supabase.table("clusters").insert(cluster_data).execute()
            cluster_id = new_cluster.data[0]["id"]

            # Add all similar grievances + new one as members
            for g in similar_grievances:
                supabase.table("cluster_members").insert({
                    "cluster_id": cluster_id,
                    "grievance_id": g["id"]
                }).execute()
            supabase.table("cluster_members").insert({
                "cluster_id": cluster_id,
                "grievance_id": grievance_id
            }).execute()

        # Escalate the new grievance since it's part of a systemic issue
        supabase.table("grievances").update({
            "escalation_level": 2,
            "status": "escalated"
        }).eq("id", grievance_id).execute()

        supabase.table("escalation_log").insert({
            "grievance_id": grievance_id,
            "escalation_level": 2,
            "reason": f"Systemic issue detected - {len(similar_grievances) + 1} similar complaints in {district}",
            "auto_triggered": True
        }).execute()

        return cluster_id

    except Exception as e:
        print(f"[Clustering] Error: {e}")
        return None
