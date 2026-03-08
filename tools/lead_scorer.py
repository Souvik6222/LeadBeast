"""
Lead Scoring Tool — rule-based scoring with ML-ready architecture
WAT Layer 3: Deterministic Tool

Uses a weighted rule-based system for v1, designed to be replaced
with an XGBoost ML model once enough training data is available.
"""
import math
from typing import Optional


def calculate_lead_score(lead: dict, enrichment: dict | None, signals: list | None) -> dict:
    """
    Calculate a lead score from 0-100 based on available data.
    
    Score components:
    - Firmographic fit: 30% weight
    - Person-level fit: 20% weight
    - Signal strength: 30% weight
    - Data completeness: 10% weight
    - Source quality: 10% weight
    """
    scores = {}
    
    # --- Firmographic Score (0-30) ---
    firmo_score = 0
    if enrichment:
        # Company size
        size = enrichment.get("company_size", 0) or 0
        if 50 <= size <= 500:
            firmo_score += 10  # Sweet spot
        elif 10 <= size < 50:
            firmo_score += 7
        elif size > 500:
            firmo_score += 5
        elif size > 0:
            firmo_score += 3
        
        # Funding
        funding = enrichment.get("total_funding_usd", 0) or 0
        if funding > 10_000_000:
            firmo_score += 8
        elif funding > 1_000_000:
            firmo_score += 5
        elif funding > 0:
            firmo_score += 3
        
        # Employee growth
        growth = enrichment.get("employee_growth_6m_pct", 0) or 0
        if growth > 20:
            firmo_score += 7
        elif growth > 10:
            firmo_score += 5
        elif growth > 0:
            firmo_score += 3
        
        # Industry relevance (tech/SaaS preferred)
        industry = (lead.get("industry") or "").lower()
        tech_industries = {"saas", "software", "technology", "fintech", "martech", "devtools", "ai"}
        if any(ind in industry for ind in tech_industries):
            firmo_score += 5
        elif industry:
            firmo_score += 2
    
    scores["firmographic"] = min(firmo_score, 30)
    
    # --- Person-Level Score (0-20) ---
    person_score = 0
    
    seniority = lead.get("seniority_level", "")
    seniority_weights = {
        "C-Suite": 10,
        "VP": 8,
        "Director": 6,
        "Manager": 4,
        "IC": 2,
    }
    person_score += seniority_weights.get(seniority, 0)
    
    if enrichment:
        if enrichment.get("is_decision_maker"):
            person_score += 6
        if enrichment.get("email_verified"):
            person_score += 2
        if enrichment.get("email_deliverable"):
            person_score += 2
    
    # Title keywords
    title = (lead.get("title") or "").lower()
    if any(kw in title for kw in ["ceo", "cto", "cfo", "coo", "founder", "owner"]):
        person_score += 5
    elif any(kw in title for kw in ["vp", "vice president", "head of", "director"]):
        person_score += 3
    elif any(kw in title for kw in ["manager", "lead"]):
        person_score += 1
    
    scores["person"] = min(person_score, 20)
    
    # --- Signal Score (0-30) ---
    signal_score = 0
    if signals:
        for signal in signals:
            strength = signal.get("signal_strength", 0) or 0
            signal_type = signal.get("signal_type", "")
            
            # Weight different signal types
            type_weights = {
                "SIGNAL_FUNDING": 1.5,
                "SIGNAL_HIRING": 1.2,
                "SIGNAL_HIRING_SALES": 1.3,
                "SIGNAL_GROWTH": 1.1,
                "SIGNAL_TECH_ADOPT": 1.0,
                "SIGNAL_EXECUTIVE": 1.0,
                "SIGNAL_EXPANSION": 0.9,
                "SIGNAL_IPO": 1.5,
            }
            weight = type_weights.get(signal_type, 0.8)
            signal_score += strength * weight
    
    scores["signals"] = min(round(signal_score), 30)
    
    # --- Data Completeness Score (0-10) ---
    completeness_score = 0
    if enrichment:
        pct = enrichment.get("enrichment_completeness_pct", 0) or 0
        completeness_score = round(pct / 10)
    else:
        # Score based on raw lead data completeness
        fields = ["email", "phone", "title", "company_website", "industry", "location", "linkedin_url"]
        filled = sum(1 for f in fields if lead.get(f))
        completeness_score = round(filled / len(fields) * 10)
    
    scores["completeness"] = min(completeness_score, 10)
    
    # --- Source Quality Score (0-10) ---
    source_score = 0
    source = (lead.get("lead_source") or "").lower()
    source_weights = {
        "referral": 10,
        "demo_request": 9,
        "organic": 7,
        "paid": 5,
        "event": 6,
        "import": 3,
        "cold": 2,
    }
    source_score = source_weights.get(source, 4)
    scores["source"] = min(source_score, 10)
    
    # --- Total Score ---
    total = sum(scores.values())
    total = max(0, min(100, total))
    
    # Classify tier
    if total >= 70:
        tier = "Hot"
    elif total >= 40:
        tier = "Warm"
    else:
        tier = "Cold"
    
    return {
        "score": round(total, 2),
        "tier": tier,
        "model_version": "rule_based_v1.0",
        "feature_vector": scores,
        "shap_values": _compute_feature_importance(scores),
    }


def _compute_feature_importance(scores: dict) -> list:
    """Generate pseudo-SHAP values showing relative feature contributions."""
    total = sum(scores.values()) or 1
    importance = []
    
    labels = {
        "firmographic": "Company Fit Score",
        "person": "Contact Seniority",
        "signals": "Buying Signals",
        "completeness": "Data Quality",
        "source": "Lead Source Quality",
    }
    
    for key, value in scores.items():
        contribution = round((value / total) * 100, 1) if total > 0 else 0
        importance.append({
            "feature": labels.get(key, key),
            "contribution": contribution,
            "raw_score": value,
        })
    
    importance.sort(key=lambda x: x["contribution"], reverse=True)
    return importance[:5]
