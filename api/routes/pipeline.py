"""
Worker routes — trigger enrichment/scoring pipeline
"""
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from db.client import get_supabase_service_client
from api.middleware.auth import get_current_user
from agents.enrichment_agent import LeadEnrichmentAgent

router = APIRouter()


async def run_enrichment_pipeline(lead_id: str, organization_id: str):
    """Background task to run enrichment pipeline."""
    agent = LeadEnrichmentAgent()
    result = await agent.enrich_lead(lead_id, organization_id)
    
    # Update job status
    supabase = get_supabase_service_client()
    status = "complete" if result["status"] != "failed" else "failed"
    
    supabase.table("enrichment_jobs").update({
        "status": status,
        "completed_at": "now()",
        "last_error": "; ".join(result.get("errors", [])) or None,
    }).eq("lead_id", lead_id).eq("job_type", "enrich").eq("status", "queued").execute()


@router.post("/pipeline/enrich/{lead_id}")
async def enrich_lead(
    lead_id: str,
    background_tasks: BackgroundTasks,
    user=Depends(get_current_user),
):
    """Trigger enrichment pipeline for a lead."""
    org_id = user["organization_id"]
    background_tasks.add_task(run_enrichment_pipeline, lead_id, org_id)
    return {"message": "Enrichment pipeline started", "lead_id": lead_id}


@router.post("/pipeline/enrich-all")
async def enrich_all_pending(
    background_tasks: BackgroundTasks,
    user=Depends(get_current_user),
):
    """Trigger enrichment for all pending leads."""
    supabase = get_supabase_service_client()
    org_id = user["organization_id"]
    
    pending = (
        supabase.table("leads")
        .select("id")
        .eq("organization_id", org_id)
        .eq("enrichment_status", "pending")
        .limit(50)
        .execute()
    )
    
    count = 0
    for lead in pending.data or []:
        background_tasks.add_task(run_enrichment_pipeline, lead["id"], org_id)
        count += 1
    
    return {"message": f"Enrichment started for {count} leads"}


@router.post("/pipeline/score/{lead_id}")
async def score_lead(
    lead_id: str,
    background_tasks: BackgroundTasks,
    user=Depends(get_current_user),
):
    """Trigger scoring pipeline for a lead."""
    org_id = user["organization_id"]
    
    async def run_scoring():
        agent = LeadEnrichmentAgent()
        await agent.score_lead(lead_id, org_id)
    
    background_tasks.add_task(run_scoring)
    return {"message": "Scoring pipeline started", "lead_id": lead_id}
