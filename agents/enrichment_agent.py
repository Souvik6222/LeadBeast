"""
Lead Enrichment Agent — WAT Layer 2: Agent (Orchestrator)
Reads the lead_enrichment workflow and coordinates tools to enrich a lead.
"""
import asyncio
from datetime import datetime
from db.client import get_supabase_service_client
from tools.domain_extractor import get_company_domain
from tools.email_validation import validate_email
from tools.web_scraper import scrape_company_website, search_company_info
from tools.news_api import (
    search_company_news, detect_funding_signal,
    detect_hiring_signal, detect_growth_signal,
)
from tools.lead_scorer import calculate_lead_score
from tools.ai_generator import generate_lead_insight, generate_email_draft


class LeadEnrichmentAgent:
    """
    Orchestrates the lead enrichment pipeline.
    Follows the lead_enrichment.md workflow.
    """
    
    def __init__(self):
        self.supabase = get_supabase_service_client()
    
    async def enrich_lead(self, lead_id: str, organization_id: str) -> dict:
        """Run the full enrichment pipeline for a single lead."""
        result = {
            "lead_id": lead_id,
            "status": "pending",
            "enrichment": {},
            "signals": [],
            "errors": [],
        }
        
        try:
            # Update lead status
            self.supabase.table("leads").update({
                "enrichment_status": "in_progress",
            }).eq("id", lead_id).execute()
            
            # Get lead data
            lead = (
                self.supabase.table("leads")
                .select("*")
                .eq("id", lead_id)
                .single()
                .execute()
            )
            
            if not lead.data:
                result["status"] = "failed"
                result["errors"].append("Lead not found")
                return result
            
            lead_data = lead.data
            enrichment_data = {"lead_id": lead_id, "organization_id": organization_id}
            
            # Step 1: Extract domain
            domain = get_company_domain(
                email=lead_data.get("email"),
                website=lead_data.get("company_website"),
            )
            if domain:
                enrichment_data["company_domain"] = domain
            
            # Step 2: Scrape company website
            if domain:
                try:
                    website_data = await scrape_company_website(domain)
                    if website_data.get("found"):
                        enrichment_data["company_name_verified"] = website_data.get("company_name")
                        enrichment_data["company_description"] = website_data.get("description")
                except Exception as e:
                    result["errors"].append(f"Website scrape failed: {str(e)}")
            
            # Step 3: Search for company info (DuckDuckGo)
            if not enrichment_data.get("company_description"):
                try:
                    search_data = await search_company_info(lead_data.get("company", ""))
                    if search_data.get("found"):
                        enrichment_data["company_description"] = search_data.get("description")
                except Exception as e:
                    result["errors"].append(f"Search failed: {str(e)}")
            
            # Step 4: Validate email
            try:
                email_result = validate_email(lead_data.get("email", ""))
                enrichment_data["email_verified"] = email_result.get("is_valid_format", False)
                enrichment_data["email_deliverable"] = email_result.get("is_deliverable", False)
            except Exception as e:
                result["errors"].append(f"Email validation failed: {str(e)}")
            
            # Step 5: News & Signal Detection
            signals = []
            try:
                articles = await search_company_news(lead_data.get("company", ""))
                
                funding = detect_funding_signal(articles)
                if funding:
                    funding["lead_id"] = lead_id
                    funding["organization_id"] = organization_id
                    signals.append(funding)
                
                hiring = detect_hiring_signal(articles)
                if hiring:
                    hiring["lead_id"] = lead_id
                    hiring["organization_id"] = organization_id
                    signals.append(hiring)
                
                growth = detect_growth_signal(articles)
                if growth:
                    growth["lead_id"] = lead_id
                    growth["organization_id"] = organization_id
                    signals.append(growth)
                    
            except Exception as e:
                result["errors"].append(f"News search failed: {str(e)}")
            
            # Step 6: Calculate completeness
            total_fields = 15
            filled = sum(1 for v in enrichment_data.values() if v is not None and v != "")
            enrichment_data["enrichment_completeness_pct"] = round(filled / total_fields * 100, 2)
            
            # Save enrichment data
            try:
                existing = (
                    self.supabase.table("lead_enrichment")
                    .select("id")
                    .eq("lead_id", lead_id)
                    .execute()
                )
                
                if existing.data:
                    self.supabase.table("lead_enrichment").update(enrichment_data).eq("lead_id", lead_id).execute()
                else:
                    self.supabase.table("lead_enrichment").insert(enrichment_data).execute()
            except Exception as e:
                result["errors"].append(f"Save enrichment failed: {str(e)}")
            
            # Save signals
            for signal in signals:
                try:
                    self.supabase.table("lead_signals").insert(signal).execute()
                except Exception as e:
                    result["errors"].append(f"Save signal failed: {str(e)}")
            
            # Step 7: Update lead status
            status = "complete" if len(result["errors"]) == 0 else "partial"
            self.supabase.table("leads").update({
                "enrichment_status": status,
                "last_enriched_at": datetime.utcnow().isoformat(),
            }).eq("id", lead_id).execute()
            
            result["status"] = status
            result["enrichment"] = enrichment_data
            result["signals"] = signals
            
            # Step 8: Run scoring
            await self.score_lead(lead_id, organization_id)
            
        except Exception as e:
            result["status"] = "failed"
            result["errors"].append(str(e))
            self.supabase.table("leads").update({
                "enrichment_status": "failed",
            }).eq("id", lead_id).execute()
        
        return result
    
    async def score_lead(self, lead_id: str, organization_id: str) -> dict:
        """Score a lead using the lead_scoring workflow."""
        try:
            # Get lead data
            lead = (
                self.supabase.table("leads")
                .select("*")
                .eq("id", lead_id)
                .single()
                .execute()
            )
            
            # Get enrichment
            enrichment = (
                self.supabase.table("lead_enrichment")
                .select("*")
                .eq("lead_id", lead_id)
                .execute()
            )
            
            # Get signals
            signals = (
                self.supabase.table("lead_signals")
                .select("*")
                .eq("lead_id", lead_id)
                .eq("is_active", True)
                .execute()
            )
            
            lead_data = lead.data
            enrichment_data = enrichment.data[0] if enrichment.data else None
            signals_data = signals.data or []
            
            # Calculate score
            score_result = calculate_lead_score(lead_data, enrichment_data, signals_data)
            
            # Save score record
            self.supabase.table("lead_scores").insert({
                "lead_id": lead_id,
                "organization_id": organization_id,
                "score": score_result["score"],
                "tier": score_result["tier"],
                "model_version": score_result["model_version"],
                "feature_vector": score_result["feature_vector"],
                "shap_values": score_result["shap_values"],
            }).execute()
            
            # Update lead with latest score
            self.supabase.table("leads").update({
                "current_score": score_result["score"],
                "tier": score_result["tier"],
                "lead_status": "scored",
                "last_scored_at": datetime.utcnow().isoformat(),
            }).eq("id", lead_id).execute()
            
            # Generate AI content for high-score leads
            if score_result["score"] >= 50:
                await self.generate_ai_content(lead_id, organization_id, lead_data, signals_data)
            
            return score_result
            
        except Exception as e:
            return {"error": str(e)}
    
    async def generate_ai_content(self, lead_id: str, organization_id: str, lead_data: dict, signals: list):
        """Generate AI insight and email draft."""
        try:
            # Generate insight
            insight = await generate_lead_insight(lead_data, signals)
            
            # Generate email
            email = await generate_email_draft(lead_data, signals)
            
            # Combine and save
            ai_content = {
                "lead_id": lead_id,
                "organization_id": organization_id,
                **insight,
                **email,
            }
            
            # Upsert
            existing = (
                self.supabase.table("lead_ai_content")
                .select("id")
                .eq("lead_id", lead_id)
                .execute()
            )
            
            if existing.data:
                self.supabase.table("lead_ai_content").update(ai_content).eq("lead_id", lead_id).execute()
            else:
                self.supabase.table("lead_ai_content").insert(ai_content).execute()
                
        except Exception as e:
            print(f"AI content generation failed for lead {lead_id}: {e}")
