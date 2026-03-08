"""
AI Lead Generation route — Groq (Llama 3.3 70B)
Generates high-quality, realistic B2B leads based on targeting criteria
"""
import json
import traceback
from datetime import datetime
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from typing import Optional
from db.client import get_supabase_service_client
from api.middleware.auth import get_current_user
from tools.ai_generator import _groq_chat, _parse_json
from tools.lead_scorer import calculate_lead_score

router = APIRouter(prefix="/leads/generate", tags=["generate"])


class GenerateRequest(BaseModel):
    industry: str = Field(..., description="Target industry, e.g. 'SaaS', 'FinTech'")
    role: str = Field(..., description="Target role, e.g. 'VP of Sales', 'CTO'")
    company_size: Optional[str] = Field(None, description="e.g. '50-200', '500+'")
    location: Optional[str] = Field(None, description="e.g. 'San Francisco', 'New York'")
    count: int = Field(5, ge=1, le=20, description="Number of leads to generate")
    additional_criteria: Optional[str] = Field(None, description="Any extra targeting criteria")


@router.post("")
async def generate_leads(req: GenerateRequest, user=Depends(get_current_user)):
    """Generate AI-powered B2B leads using Groq Llama 3.3"""
    try:
        messages = [
            {
                "role": "system",
                "content": (
                    "You are a B2B sales data specialist. Generate realistic but fictional lead profiles "
                    "for sales prospecting. Each lead must feel like a real person at a real company — "
                    "use realistic names, company names that sound like real startups/enterprises in the "
                    "given industry, proper email formats, and accurate job titles. "
                    "Always respond in valid JSON format."
                )
            },
            {
                "role": "user",
                "content": f"""Generate {req.count} realistic B2B sales leads matching these criteria:

Target Profile:
- Industry: {req.industry}
- Decision-maker Role: {req.role}
- Company Size: {req.company_size or 'Any size'}
- Location/Market: {req.location or 'Any'}
{f'- Additional: {req.additional_criteria}' if req.additional_criteria else ''}

Requirements for EACH lead:
1. First & last name — diverse, culturally varied, realistic
2. Email — format: firstname.lastname@companyname.com (lowercase, no spaces)
3. Company — realistic name that sounds like a real {req.industry} company (NOT generic like "TechCorp")
4. Title — realistic job title matching "{req.role}" level
5. Phone — realistic format like +1 (555) 123-4567
6. Industry — specific sub-industry within {req.industry}
7. Location — specific city + state/country
8. Company website — realistic domain (companyname.com)
9. Seniority — one of: IC, Manager, Director, VP, C-Suite
10. Company size estimate — realistic employee count

Return JSON:
{{
  "leads": [
    {{
      "first_name": "...",
      "last_name": "...",
      "email": "...",
      "company": "...",
      "title": "...",
      "phone": "...",
      "industry": "...",
      "location": "...",
      "company_website": "...",
      "seniority_level": "...",
      "company_size_estimate": "..."
    }}
  ]
}}"""
            }
        ]

        text = _groq_chat(messages, temperature=0.8, max_tokens=4096)
        data = _parse_json(text)
        generated_leads = data.get("leads", [])

        # Insert into database
        supabase = get_supabase_service_client()
        org_id = user.get("organization_id")

        inserted = []
        for lead in generated_leads:
            # Auto-detect seniority from title if not provided
            seniority = lead.get("seniority_level")
            if not seniority:
                title_lower = (lead.get("title") or "").lower()
                if any(kw in title_lower for kw in ["ceo", "cto", "cfo", "coo", "founder", "owner", "chief"]):
                    seniority = "C-Suite"
                elif any(kw in title_lower for kw in ["vp", "vice president"]):
                    seniority = "VP"
                elif any(kw in title_lower for kw in ["director", "head of"]):
                    seniority = "Director"
                elif any(kw in title_lower for kw in ["manager", "lead"]):
                    seniority = "Manager"
                else:
                    seniority = "IC"

            lead_data = {
                "organization_id": org_id,
                "first_name": lead.get("first_name", ""),
                "last_name": lead.get("last_name", ""),
                "email": lead.get("email", ""),
                "company": lead.get("company", ""),
                "title": lead.get("title"),
                "phone": lead.get("phone"),
                "industry": lead.get("industry", req.industry),
                "location": lead.get("location"),
                "company_website": lead.get("company_website"),
                "seniority_level": seniority,
                "lead_source": "AI Generated",
                "lead_status": "new",
                "enrichment_status": "pending",
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
            }

            try:
                result = supabase.table("leads").insert(lead_data).execute()
                if result.data:
                    inserted_lead = result.data[0]
                    # Auto-score the lead immediately
                    try:
                        score_result = calculate_lead_score(inserted_lead, None, None)
                        supabase.table("leads").update({
                            "current_score": score_result["score"],
                            "tier": score_result["tier"],
                            "last_scored_at": datetime.utcnow().isoformat(),
                        }).eq("id", inserted_lead["id"]).execute()
                        inserted_lead["current_score"] = score_result["score"]
                        inserted_lead["tier"] = score_result["tier"]
                    except Exception as score_err:
                        print(f"[GENERATE] Score error for {lead.get('email')}: {score_err}")
                    inserted.append(inserted_lead)
            except Exception as e:
                print(f"[GENERATE] Failed to insert lead {lead.get('email')}: {e}")
                continue

        return {
            "generated": len(generated_leads),
            "inserted": len(inserted),
            "leads": inserted,
        }

    except json.JSONDecodeError as e:
        return {"error": f"AI response was not valid JSON: {str(e)}", "leads": []}
    except Exception as e:
        traceback.print_exc()
        error_str = str(e).lower()
        if "429" in str(e) or "rate" in error_str or "quota" in error_str:
            return {
                "error": "Rate limit reached. Please wait a minute and try again.",
                "leads": [],
            }
        return {"error": str(e), "leads": []}
