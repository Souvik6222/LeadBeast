"""
Direct Tool routes — for use by the frontend dashboards
"""
from fastapi import APIRouter, Depends, Query
from api.middleware.auth import get_current_user
from tools.email_validation import validate_email
from tools.web_scraper import search_company_info, scrape_local_business_info

router = APIRouter()

@router.get("/tools/verify-email")
async def api_verify_email(email: str = Query(...), user=Depends(get_current_user)):
    """Verify a single email address."""
    result = validate_email(email)
    return {"status": "success", "result": result}

@router.get("/tools/scrape-search")
async def api_scrape_search(query: str = Query(...), location: str = Query(""), sources: str = Query(""), user=Depends(get_current_user)):
    """Search DuckDuckGo or Yelp for local businesses or generic companies."""
    # Always use the HTML scraper which returns a list of distinct results,
    # rather than the Instant Answer API which only returns one definition.
    result = await scrape_local_business_info(query, location, sources)
    
    if isinstance(result, dict):  # Fallback safety
        result = [result] if result.get("found") else []
    
    return {"status": "success", "result": result}
