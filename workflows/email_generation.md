---
WORKFLOW: Email Generation
VERSION: 1.0
TRIGGER: Lead scored >= 50 OR manual request
---

## Objective

Generate a personalized outreach email draft for a scored lead.

## Required Input
- lead_id: UUID of the lead
- organization_id: UUID of the organization
- tone: Professional | Conversational | Direct | Educational (default: Professional)

## Steps

1. **Load lead context**
   - Pull lead data, enrichment, signals, score from database

2. **Generate insight** using AI
   - Tool: `tools/ai_generator.py` → `generate_lead_insight()`
   - Uses Google Gemini free tier
   - Produces: reason, signal summary, conversation opener

3. **Generate email draft** using AI
   - Tool: `tools/ai_generator.py` → `generate_email_draft()`
   - Uses Google Gemini free tier
   - Produces: 2 subject line variants + email body

4. **Store AI content**
   - Upsert into lead_ai_content table (one record per lead)
   - Record: insight, email draft, model used, timestamp

## Email Quality Rules
- Max body: 150 words
- Must reference at least one specific company data point
- Must include a clear call-to-action
- No generic phrases: "I hope this email finds you well", "touching base"
- Generate 2 subject line variants for A/B testing

## Fallback
- If Gemini API unavailable: use template-based fallback
- Fallback templates use lead name + company data for basic personalization

## Output
- lead_ai_content record with insight + email draft
