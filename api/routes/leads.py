"""
Lead CRUD routes — the core of the API
"""
import csv
import io
import re
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Query
from typing import Optional, List
from db.client import get_supabase_service_client
from models.schemas import (
    LeadCreate, LeadBulkCreate, LeadUpdate, LeadFilter,
    ActivityCreate, BulkCreateResponse,
)
from api.middleware.auth import get_current_user

router = APIRouter()


def validate_email(email: str) -> bool:
    """Basic email validation."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


@router.post("/leads")
async def create_leads(body: LeadBulkCreate, user=Depends(get_current_user)):
    """Ingest one or more leads."""
    supabase = get_supabase_service_client()
    org_id = user["organization_id"]
    
    result = BulkCreateResponse()
    
    for lead_data in body.leads:
        try:
            if not validate_email(lead_data.email):
                result.errors.append(f"Invalid email: {lead_data.email}")
                result.skipped += 1
                continue
            
            lead_dict = lead_data.model_dump(exclude_none=True)
            lead_dict["organization_id"] = org_id
            
            # Try upsert (deduplicate by org_id + email)
            existing = (
                supabase.table("leads")
                .select("id")
                .eq("organization_id", org_id)
                .eq("email", lead_data.email)
                .execute()
            )
            
            if existing.data:
                # Update existing lead
                supabase.table("leads").update(lead_dict).eq("id", existing.data[0]["id"]).execute()
                result.updated += 1
            else:
                # Insert new lead
                new_lead = supabase.table("leads").insert(lead_dict).execute()
                result.created += 1
                
                # Queue enrichment job if auto_enrich
                if body.auto_enrich and new_lead.data:
                    supabase.table("enrichment_jobs").insert({
                        "lead_id": new_lead.data[0]["id"],
                        "organization_id": org_id,
                        "job_type": "enrich",
                        "status": "queued",
                    }).execute()
                    
        except Exception as e:
            result.errors.append(f"Error for {lead_data.email}: {str(e)}")
            result.skipped += 1
    
    return result.model_dump()


@router.post("/leads/upload-csv")
async def upload_csv(
    file: UploadFile = File(...),
    auto_enrich: bool = Query(True),
    user=Depends(get_current_user),
):
    """Upload CSV file of leads."""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    content = await file.read()
    text = content.decode('utf-8')
    reader = csv.DictReader(io.StringIO(text))
    
    leads = []
    for row in reader:
        # Map common CSV column names
        lead = LeadCreate(
            first_name=row.get('first_name', row.get('First Name', '')),
            last_name=row.get('last_name', row.get('Last Name', '')),
            email=row.get('email', row.get('Email', '')),
            company=row.get('company', row.get('Company', '')),
            company_website=row.get('company_website', row.get('Website', None)),
            title=row.get('title', row.get('Title', None)),
            phone=row.get('phone', row.get('Phone', None)),
            industry=row.get('industry', row.get('Industry', None)),
            location=row.get('location', row.get('Location', None)),
            linkedin_url=row.get('linkedin_url', row.get('LinkedIn', None)),
            lead_source=row.get('lead_source', row.get('Source', 'import')),
        )
        leads.append(lead)
    
    if len(leads) > 10000:
        raise HTTPException(status_code=400, detail="Max 10,000 leads per upload")
    
    bulk = LeadBulkCreate(leads=leads, auto_enrich=auto_enrich)
    return await create_leads(bulk, user)


@router.get("/leads")
async def get_leads(
    page: int = Query(1, ge=1),
    per_page: int = Query(25, ge=1, le=100),
    sort_by: str = Query("current_score"),
    sort_order: str = Query("desc"),
    tier: Optional[str] = None,
    status: Optional[str] = None,
    industry: Optional[str] = None,
    lead_source: Optional[str] = None,
    search: Optional[str] = None,
    assigned_to: Optional[str] = None,
    user=Depends(get_current_user),
):
    """Get paginated, filtered, sorted leads."""
    supabase = get_supabase_service_client()
    org_id = user["organization_id"]
    
    query = supabase.table("leads").select("*", count="exact").eq("organization_id", org_id)
    
    if tier:
        query = query.eq("tier", tier)
    if status:
        query = query.eq("lead_status", status)
    if industry:
        query = query.ilike("industry", f"%{industry}%")
    if lead_source:
        query = query.eq("lead_source", lead_source)
    if assigned_to:
        query = query.eq("assigned_to", assigned_to)
    if search:
        query = query.or_(
            f"first_name.ilike.%{search}%,last_name.ilike.%{search}%,email.ilike.%{search}%,company.ilike.%{search}%"
        )
    
    # Sort
    is_desc = sort_order == "desc"
    query = query.order(sort_by, desc=is_desc, nullsfirst=False)
    
    # Paginate
    offset = (page - 1) * per_page
    query = query.range(offset, offset + per_page - 1)
    
    result = query.execute()
    
    total = result.count or 0
    
    return {
        "data": result.data,
        "meta": {
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": (total + per_page - 1) // per_page if total > 0 else 0,
        },
    }


@router.get("/leads/top")
async def get_top_leads(
    limit: int = Query(20, ge=1, le=100),
    user=Depends(get_current_user),
):
    """Get top N leads by score for today's priority list."""
    supabase = get_supabase_service_client()
    org_id = user["organization_id"]
    
    result = (
        supabase.table("leads")
        .select("*")
        .eq("organization_id", org_id)
        .not_.is_("current_score", "null")
        .order("current_score", desc=True)
        .limit(limit)
        .execute()
    )
    
    return {"leads": result.data}


@router.get("/leads/{lead_id}")
async def get_lead_detail(lead_id: str, user=Depends(get_current_user)):
    """Get full lead detail with enrichment, signals, scores, activity."""
    supabase = get_supabase_service_client()
    org_id = user["organization_id"]
    
    # Get lead
    lead = (
        supabase.table("leads")
        .select("*")
        .eq("id", lead_id)
        .eq("organization_id", org_id)
        .single()
        .execute()
    )
    
    if not lead.data:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    # Get enrichment
    enrichment = (
        supabase.table("lead_enrichment")
        .select("*")
        .eq("lead_id", lead_id)
        .execute()
    )
    
    # Get signals
    signals = (
        supabase.table("lead_signals")
        .select("*")
        .eq("lead_id", lead_id)
        .order("signal_strength", desc=True)
        .execute()
    )
    
    # Get score history
    scores = (
        supabase.table("lead_scores")
        .select("*")
        .eq("lead_id", lead_id)
        .order("scored_at", desc=True)
        .limit(30)
        .execute()
    )
    
    # Get AI content
    ai_content = (
        supabase.table("lead_ai_content")
        .select("*")
        .eq("lead_id", lead_id)
        .execute()
    )
    
    # Get activity
    activity = (
        supabase.table("sales_activity")
        .select("*, users(full_name)")
        .eq("lead_id", lead_id)
        .order("created_at", desc=True)
        .limit(20)
        .execute()
    )
    
    return {
        **lead.data,
        "enrichment": enrichment.data[0] if enrichment.data else None,
        "signals": signals.data,
        "latest_score": scores.data[0] if scores.data else None,
        "score_history": scores.data,
        "ai_content": ai_content.data[0] if ai_content.data else None,
        "activity": activity.data,
    }


@router.patch("/leads/{lead_id}")
async def update_lead(lead_id: str, body: LeadUpdate, user=Depends(get_current_user)):
    """Update a lead."""
    supabase = get_supabase_service_client()
    org_id = user["organization_id"]
    
    update_data = body.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = (
        supabase.table("leads")
        .update(update_data)
        .eq("id", lead_id)
        .eq("organization_id", org_id)
        .execute()
    )
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    return result.data[0]


@router.delete("/leads/{lead_id}")
async def delete_lead(lead_id: str, user=Depends(get_current_user)):
    """Archive/delete a lead (admin only)."""
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    supabase = get_supabase_service_client()
    org_id = user["organization_id"]
    
    supabase.table("leads").delete().eq("id", lead_id).eq("organization_id", org_id).execute()
    
    return {"message": "Lead deleted"}


@router.post("/leads/{lead_id}/activities")
async def log_activity(lead_id: str, body: ActivityCreate, user=Depends(get_current_user)):
    """Log a sales activity on a lead."""
    supabase = get_supabase_service_client()
    org_id = user["organization_id"]
    
    # Verify lead exists
    lead = (
        supabase.table("leads")
        .select("id")
        .eq("id", lead_id)
        .eq("organization_id", org_id)
        .execute()
    )
    if not lead.data:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    activity_data = body.model_dump(exclude_none=True)
    activity_data["lead_id"] = lead_id
    activity_data["organization_id"] = org_id
    activity_data["user_id"] = user["id"]
    
    result = supabase.table("sales_activity").insert(activity_data).execute()
    
    # Update lead status based on activity
    status_map = {
        "called": "contacted",
        "emailed": "contacted",
        "meeting_booked": "contacted",
        "qualified": "qualified",
        "disqualified": "disqualified",
        "converted": "converted",
    }
    new_status = status_map.get(body.activity_type)
    if new_status:
        supabase.table("leads").update({"lead_status": new_status}).eq("id", lead_id).execute()
    
    return result.data[0]


@router.get("/leads/{lead_id}/activities")
async def get_activities(lead_id: str, user=Depends(get_current_user)):
    """Get activity log for a lead."""
    supabase = get_supabase_service_client()
    org_id = user["organization_id"]
    
    result = (
        supabase.table("sales_activity")
        .select("*")
        .eq("lead_id", lead_id)
        .eq("organization_id", org_id)
        .order("created_at", desc=True)
        .execute()
    )
    
    return {"activities": result.data}


@router.post("/leads/{lead_id}/enrich")
async def trigger_enrichment(lead_id: str, user=Depends(get_current_user)):
    """Queue enrichment for a lead."""
    supabase = get_supabase_service_client()
    org_id = user["organization_id"]
    
    # Queue enrichment job
    job = supabase.table("enrichment_jobs").insert({
        "lead_id": lead_id,
        "organization_id": org_id,
        "job_type": "enrich",
        "status": "queued",
    }).execute()
    
    supabase.table("leads").update({
        "enrichment_status": "in_progress",
    }).eq("id", lead_id).execute()
    
    return {"job_id": job.data[0]["id"], "message": "Enrichment queued"}


@router.post("/leads/{lead_id}/score")
async def trigger_scoring(lead_id: str, user=Depends(get_current_user)):
    """Queue scoring for a lead."""
    supabase = get_supabase_service_client()
    org_id = user["organization_id"]
    
    job = supabase.table("enrichment_jobs").insert({
        "lead_id": lead_id,
        "organization_id": org_id,
        "job_type": "score",
        "status": "queued",
    }).execute()
    
    return {"job_id": job.data[0]["id"], "message": "Scoring queued"}
