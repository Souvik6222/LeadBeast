"""
Analytics routes — dashboard summary, model performance
"""
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query
from db.client import get_supabase_service_client
from api.middleware.auth import get_current_user

router = APIRouter()


@router.get("/analytics/summary")
async def get_summary(user=Depends(get_current_user)):
    """Dashboard summary statistics."""
    supabase = get_supabase_service_client()
    org_id = user["organization_id"]
    
    # Total leads
    total = (
        supabase.table("leads")
        .select("id", count="exact")
        .eq("organization_id", org_id)
        .execute()
    )
    
    # Hot leads
    hot = (
        supabase.table("leads")
        .select("id", count="exact")
        .eq("organization_id", org_id)
        .eq("tier", "Hot")
        .execute()
    )
    
    # Warm leads
    warm = (
        supabase.table("leads")
        .select("id", count="exact")
        .eq("organization_id", org_id)
        .eq("tier", "Warm")
        .execute()
    )
    
    # Cold leads
    cold = (
        supabase.table("leads")
        .select("id", count="exact")
        .eq("organization_id", org_id)
        .eq("tier", "Cold")
        .execute()
    )
    
    # Average score
    scored_leads = (
        supabase.table("leads")
        .select("current_score")
        .eq("organization_id", org_id)
        .not_.is_("current_score", "null")
        .execute()
    )
    
    avg_score = 0.0
    if scored_leads.data:
        scores = [l["current_score"] for l in scored_leads.data if l["current_score"] is not None]
        if scores:
            avg_score = round(sum(scores) / len(scores), 1)
    
    # Meetings booked (last 30 days)
    thirty_days_ago = (datetime.utcnow() - timedelta(days=30)).isoformat()
    meetings = (
        supabase.table("sales_activity")
        .select("id", count="exact")
        .eq("organization_id", org_id)
        .eq("activity_type", "meeting_booked")
        .gte("created_at", thirty_days_ago)
        .execute()
    )
    
    # New leads (last 7 days)
    seven_days_ago = (datetime.utcnow() - timedelta(days=7)).isoformat()
    new_leads = (
        supabase.table("leads")
        .select("id", count="exact")
        .eq("organization_id", org_id)
        .gte("created_at", seven_days_ago)
        .execute()
    )
    
    return {
        "total_leads": total.count or 0,
        "hot_leads": hot.count or 0,
        "warm_leads": warm.count or 0,
        "cold_leads": cold.count or 0,
        "avg_score": avg_score,
        "meetings_booked_30d": meetings.count or 0,
        "new_leads_7d": new_leads.count or 0,
        "scored_leads": len(scored_leads.data) if scored_leads.data else 0,
    }


@router.get("/analytics/score-distribution")
async def get_score_distribution(user=Depends(get_current_user)):
    """Get score distribution for histogram."""
    supabase = get_supabase_service_client()
    org_id = user["organization_id"]
    
    leads = (
        supabase.table("leads")
        .select("current_score")
        .eq("organization_id", org_id)
        .not_.is_("current_score", "null")
        .execute()
    )
    
    # Build distribution buckets
    buckets = {f"{i}-{i+9}": 0 for i in range(0, 100, 10)}
    for lead in leads.data or []:
        score = lead["current_score"]
        if score is not None:
            bucket_start = int(score // 10) * 10
            bucket_start = min(bucket_start, 90)
            key = f"{bucket_start}-{bucket_start + 9}"
            buckets[key] = buckets.get(key, 0) + 1
    
    return {
        "distribution": [
            {"range": k, "count": v} for k, v in buckets.items()
        ]
    }


@router.get("/analytics/tier-performance")
async def get_tier_performance(user=Depends(get_current_user)):
    """Get conversion rate by tier."""
    supabase = get_supabase_service_client()
    org_id = user["organization_id"]
    
    tiers = ["Hot", "Warm", "Cold"]
    result = []
    
    for tier in tiers:
        total = (
            supabase.table("leads")
            .select("id", count="exact")
            .eq("organization_id", org_id)
            .eq("tier", tier)
            .execute()
        )
        
        converted = (
            supabase.table("leads")
            .select("id", count="exact")
            .eq("organization_id", org_id)
            .eq("tier", tier)
            .eq("lead_status", "converted")
            .execute()
        )
        
        total_count = total.count or 0
        converted_count = converted.count or 0
        rate = round(converted_count / total_count * 100, 1) if total_count > 0 else 0
        
        result.append({
            "tier": tier,
            "total": total_count,
            "converted": converted_count,
            "conversion_rate": rate,
        })
    
    return {"tiers": result}


@router.get("/analytics/activity-feed")
async def get_activity_feed(
    limit: int = Query(20, ge=1, le=50),
    user=Depends(get_current_user),
):
    """Get recent activity feed for dashboard."""
    supabase = get_supabase_service_client()
    org_id = user["organization_id"]
    
    activities = (
        supabase.table("sales_activity")
        .select("*, leads(first_name, last_name, company)")
        .eq("organization_id", org_id)
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    
    return {"activities": activities.data}
