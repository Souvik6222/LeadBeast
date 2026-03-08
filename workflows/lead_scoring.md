---
WORKFLOW: Lead Scoring
VERSION: 1.0
TRIGGER: Enrichment complete OR manual score request OR daily re-score
---

## Objective

Score a lead from 0-100 and classify as Hot/Warm/Cold.

## Required Input
- lead_id: UUID of the lead
- organization_id: UUID of the organization

## Steps

1. **Gather all lead data**
   - Pull lead record from leads table
   - Pull enrichment data from lead_enrichment table
   - Pull active signals from lead_signals table

2. **Calculate score** using rule-based model
   - Tool: `tools/lead_scorer.py`
   - Components:
     - Firmographic fit (30% weight): company size, funding, industry, growth
     - Person-level fit (20% weight): seniority, decision maker, email quality
     - Signal strength (30% weight): weighted sum of active signals
     - Data completeness (10% weight): enrichment coverage
     - Source quality (10% weight): lead source scoring

3. **Classify tier**
   - Hot: score >= 70
   - Warm: score 40-69
   - Cold: score < 40

4. **Generate feature importance** (pseudo-SHAP)
   - Calculate contribution of each component to total score
   - Return top 5 contributing features

5. **Store score record**
   - Append to lead_scores table (immutable history)
   - Update leads.current_score, leads.tier, leads.last_scored_at

6. **Trigger AI content generation**
   - If score >= 50: queue 'research' and 'email' jobs
   - AI tools will generate insight + email draft

## Thresholds (configurable)
- Hot threshold: 70
- Warm threshold: 40
- These can be adjusted in organization settings

## Output
- lead_scores record with score, tier, feature_vector, shap_values
- Updated lead record
